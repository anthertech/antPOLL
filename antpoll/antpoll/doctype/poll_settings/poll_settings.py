# Copyright (c) 2025, Anther Technologies Pvt Ltd and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document


class PollSettings(Document):

	def before_save(self):
		if self.default_leaderboard:
			energy_point_rules = frappe.get_all("Energy Point Rule", filters={"reference_doctype": "Poll Vote", "enabled": 0})
			if energy_point_rules:
				self.energy_Point_Enable()
		else:
			self.disable_energy_point_rules()
	
		
	def energy_Point_Enable(self):
		energy_point_rules = frappe.get_all("Energy Point Rule", filters={"reference_doctype": "Poll Vote", "enabled": 0})
		for rule in energy_point_rules:
			frappe.db.set_value("Energy Point Rule", rule.name, "enabled", 1)
		frappe.db.commit()
	
	def disable_energy_point_rules(self):
		energy_point_rules = frappe.get_all("Energy Point Rule", filters={"reference_doctype": "Poll Vote", "enabled": 1})
		for rule in energy_point_rules:
			frappe.db.set_value("Energy Point Rule", rule.name, "enabled", 0)

	def on_update(self):
		"""Sync Poll Master role with the users listed in set_poll_masters table."""
		role_name = "Poll Master"

        # Ensure the role exists
		if not frappe.db.exists("Role", role_name):
			frappe.get_doc({
				"doctype": "Role",
				"role_name": role_name
			}).insert(ignore_permissions=True)

        # Users currently selected in Poll Settings child table
		current_poll_masters = {row.poll_master for row in self.set_poll_masters if row.poll_master}

        # Users who currently have Poll Master role
		existing_role_users = set(frappe.get_all(
			"Has Role",
			filters={"role": role_name},
			pluck="parent"
		))

		#  Add role to new poll masters
		for user in current_poll_masters - existing_role_users:
			frappe.get_doc({
				"doctype": "Has Role",
				"parent": user,
				"parentfield": "roles",
				"parenttype": "User",
				"role": role_name
			}).insert(ignore_permissions=True)

		# Remove role from users no longer in the child table
		for user in existing_role_users - current_poll_masters:
			frappe.db.delete("Has Role", {
				"parent": user,
				"role": role_name
			})
		frappe.db.commit()
				

				

