# Copyright (c) 2025, Anther Technologies Pvt Ltd and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from datetime import time



class PollVote(Document):
    
	def before_insert(self):
		if not self.is_correct:
			return

		def time_to_seconds(t):
			if isinstance(t, time):
				return t.hour * 3600 + t.minute * 60 + t.second
			try:
				h, m, s = map(float, str(t).split(':'))
				return int(h) * 3600 + int(m) * 60 + int(s)
			except Exception as e:
				frappe.log_error(f"Invalid vote_time format: {t} ({e})")
				return float('inf')

		current_vote_seconds = time_to_seconds(self.vote_time)

		all_votes = frappe.get_all("Poll Vote",
			filters={
				"poll": self.poll,
				"quest_id": self.quest_id,
				"is_correct": 1
			},
			fields=["name", "vote_time"]
		)

		is_first = True
		for vote in all_votes:
			existing_seconds = time_to_seconds(vote["vote_time"])
			if existing_seconds < current_vote_seconds:
				is_first = False
				break

		if is_first:
			self.is_first = 1
