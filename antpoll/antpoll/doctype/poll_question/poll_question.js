// Copyright (c) 2025, Anther Technologies Pvt Ltd and contributors
// For license information, please see license.txt

frappe.ui.form.on('Poll Question', {
    onload: function(frm) {
        if (!frappe.user.has_role('Poll Master') && frappe.user.has_role("Participant")) {
            console.log(frappe.user_roles)
            frm.set_df_property('options', 'hidden', 1);

        }
    }
  });