# Copyright (c) 2025, Anther Technologies Pvt Ltd and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.auth import LoginManager
import time

class CommunityPollUsers(Document):
	def validate(self):
		if frappe.db.exists("Community Poll Users", {"email": self.email}):
				frappe.throw("A user with this email already exists")

		if self.password and len(self.password) < 8:
			frappe.throw("Password must be at least 8 characters long")

	def after_insert(self):
		if self.password:
			password = self.password
		else:
			password = frappe.generate_hash(length=12)
			self.password = password
			self.save(ignore_permissions=True)

		if not frappe.db.exists('User',self.email):
			doc=frappe.new_doc('User')
			doc.update({
				"email":self.email,
				# "time_zone":time_zone,
				"first_name":self.first_name,
				"mobile_no":self.mobile_number,
				"new_password":password,
				"send_welcome_email":0,
				"user_type":"System User"
			})
			if frappe.db.exists("Role", "Participant"):
				doc.append("roles", {"role": "Participant"})
			doc.save(ignore_permissions=True)

			login_manager = LoginManager()
			login_manager.authenticate(self.email, self.password)
			login_manager.post_login()
			self.create_user_permission()
		else:
			# if the user exist with this email
			# check the user has "Participant" role
			doc=frappe.get_doc('User',self.email)
			if frappe.db.exists("Role", "Participant") and "Participant" not in frappe.get_roles(self.email):
				doc.append("roles", {"role": "Participant"})
			doc.save(ignore_permissions=True)

			# check user permission exist
			if not frappe.db.exists('User Permission',{"user":self.email,"allow":"User","for_value":self.email}):
				self.create_user_permission()

		if self.email:
			self.assign_user()
			
	# create user permission
	def create_user_permission(self):
		doc_perm=frappe.new_doc('User Permission')
		doc_perm.update({
			"user":self.email,
			"allow":"User",
			"for_value":self.email,
			"apply_to_all_doctypes":True
		})
		doc_perm.save(ignore_permissions=True)

	# assigning user link
	def assign_user(self):
		uid = frappe.db.get_value("User", {"email": self.email}, "name")
		if uid:
			frappe.db.set_value(self.doctype, self.name, "user_id", uid)
