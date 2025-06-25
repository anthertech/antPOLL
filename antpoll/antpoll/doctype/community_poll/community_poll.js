// Copyright (c) 2025, Anther Technologies Pvt Ltd and contributors
// For license information, please see license.txt


frappe.ui.form.on("Community Poll", {
    // ID assign to route  
  
    refresh: function(frm) {

        // if (frm.doc.quest_qr && frm.fields_dict.qr_preview) {
        //     // build the full URL for the image
        //     const image_url = frappe.urllib.get_full_url(frm.doc.quest_qr);

        //     // construct the HTML for the image preview
        //     const html = `
        //         <div style="width:100%; text-align:center; margin-top:10px;">
        //             <img src="${image_url}" 
        //                  style="width:300px; height:auto; 
        //                         border:1px solid #ddd; padding:5px; 
        //                         border-radius:6px;" />
        //         </div>`;

        //     // set the HTML content of the 'qr_preview' field
        //     frm.fields_dict.qr_preview.$wrapper.html(html);
        // }
       
        // Check if the user has the role "Participant"
        if (!frappe.user.has_role('Poll Master') && frappe.user.has_role("Participant")) {

            console.log("yes")
            console.log(frappe.session.user)
            console.log(frappe.user_roles)

            frm.set_df_property("title", "read_only", 1);
            frm.set_df_property("description", "read_only", 1);
            frm.set_df_property("status", "read_only", 1);
            frm.set_df_property("published", "read_only", 1);
            frm.set_df_property("end_date", "read_only", 1);
            frm.set_df_property("has_shown_qr","read_only",1);
            frm.set_df_property("questions","read_only",1);

            frm.fields_dict.options.grid.wrapper.find('.grid-add-row').hide();
            frm.fields_dict.options.grid.wrapper.find('.grid-remove-rows').hide();
            frm.fields_dict.options.grid.wrapper.find('.grid-row-check').hide();
            frm.fields_dict.options.grid.wrapper.find('.grid-footer').hide();        
            frm.fields_dict.options.grid.df.read_only = 1;
            frm.fields_dict.options.grid.refresh();
        }


        // Dropdown: Poll Actions
        frm.add_custom_button('Launch', () => {
            frm.set_value('status', 'Open').then(() => {
                frm.save();
                
            });
        }, 'Poll Actions');

        frm.add_custom_button('Re-Launch', () => {
            frm.set_value('status', 'Reopen').then(() => {
                frm.save();
               
            });
        }, 'Poll Actions');
        
  ;
        frm.add_custom_button('End', () => {
            frm.set_value('status', 'Closed').then(() => {
                frm.save();
                
            });
        }, 'Poll Actions');


        // Reset button for reset Leaderboard, Poll vote and Total Views

        frm.add_custom_button(__('Reset Poll'), () => {
           frm.set_value('has_shown_qr', 0).then(() => {
                frm.save();  
            });
        
            // call reset method
            frappe.call({
                method: "antpoll.antpoll.doctype.community_poll.community_poll.reset", 
                args: {
                    docname: frm.docname
                },
                callback: function(r) {
                    if (r.message) {
                        frappe.msgprint(__('Poll has been reset successfully.'));
                    } else {
                        frappe.msgprint(__('An error occurred while resetting the poll.'));
                    }
                }
            });

        }).css({'background-color':'black', 'color': '#FFFFFF'});

        // Style the button
        btn.css({
            'background-color': 'black',
            'color': '#FFFFFF',
            'border-color': 'white'
        });

    },
    validate: function(frm) {
        if (frm.doc.status == "Open" || frm.doc.status == "Reopen") {
            frm.doc.is_published = 1;
        } 
    },
    onload: function(frm) {
        frm.fields_dict['questions'].grid.get_field('question').get_query = function (doc, cdt, cdn) {
            const existing_questions = (frm.doc.questions || []).map(item => item.question).filter(q => q);

            return {
                filters: [
                    ['Poll Question', 'name', 'not in', existing_questions]
                ],
                fields: ['name', 'question'],
            };
        };
    }
    
});


frappe.ui.form.on('Question Items', {
    form_render(frm, cdt, cdn) {
        const d = locals[cdt][cdn];

        if (d.name && frm.doc.name) {
            // Call server method to get vote data
            frappe.call({
                method: "antpoll.antpoll.doctype.community_poll.community_poll.get_option_vote_data",
                args: {
                    poll_id: frm.doc.name,
                    question_name: d.question
                },
                callback: function (r) {
                    if (r.message) {
                        const options_data = r.message;

                        let table_html = `
                           <p style="margin:10px 0px; color:black; font-size:17px;">Result Summary</p>
                            <table class="table table-bordered table-striped" style="margin-top: 10px;">
                                <thead>
                                    <tr>
                                        <th>Option</th>
                                        <th>Votes</th>
                                        <th>Percentage</th>
                                    </tr>
                                </thead>
                                <tbody>`;

                        for (let opt of options_data) {
                            table_html += `
                                <tr>
                                    <td>${opt.option}</td>
                                    <td>${opt.count}</td>
                                    <td>${opt.percent}%</td>
                                </tr>`;
                        }

                        table_html += `</tbody></table>`;
                        frm.cur_grid.grid_form.fields_dict.options_result.$wrapper.html(table_html);
                    }
                }
            });
        }
    }
});