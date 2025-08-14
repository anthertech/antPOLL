frappe.listview_settings['User'] = {
    onload(listview) {
        listview.page.add_actions_menu_item(__('Add Poll Participants'), function() {
            const selected = listview.get_checked_items();
            
            if (!selected.length) {
                frappe.msgprint(__('Please select at least one user.'));
                return;
            }

            frappe.call({
                method: "antpoll.antpoll.doctype.community_poll.community_poll.add_poll_participants",
                args: {
                    users: selected.map(u => u.name)
                },
                callback: function(r) {
                    if (!r.exc) {
                        frappe.msgprint(__('Participant role assigned to selected users.'));
                        listview.refresh();
                    }
                }
            });
        });
    }
};
