// Copyright (c) 2025, Anther Technologies Pvt Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('Poll Question', {
    onload: function(frm) {
      // Check if the current user has the 'Poll Admin' role
      frappe.call({
        method: "frappe.client.get",
        args: {
          doctype: "User",
          name: frappe.session.user
        },
        callback: function(r) {
          if (r.message) {
            const roles = r.message.roles.map(role => role.role);
            if (!roles.includes("Poll Admin") && roles.includes("Poll User")) {
              // Hide the Options child table
              frm.set_df_property('options', 'hidden', 1);
            }
          }
        }
      });
    }
  });