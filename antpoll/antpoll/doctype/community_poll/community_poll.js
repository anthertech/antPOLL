// Copyright (c) 2025, Anther Technologies Pvt Ltd and contributors
// For license information, please see license.txt


frappe.ui.form.on("Community Poll", {
    // ID assign to route  
  
    refresh: function(frm) {
        // Role-based readonly enforcement for Participants (but not Poll Master)
        if (!frappe.user.has_role('Poll Master') && frappe.user.has_role("Participant")) {
            frm.set_df_property("title", "read_only", 1);
            frm.set_df_property("description", "read_only", 1);
            frm.set_df_property("status", "read_only", 1);
            frm.set_df_property("published", "read_only", 1);
            frm.set_df_property("end_date", "read_only", 1);
            frm.set_df_property("has_shown_qr","read_only",1);
            frm.set_df_property("questions","read_only",1);

            if (frm.fields_dict.options && frm.fields_dict.options.grid) {
                frm.fields_dict.options.grid.wrapper.find('.grid-add-row').hide();
                frm.fields_dict.options.grid.wrapper.find('.grid-remove-rows').hide();
                frm.fields_dict.options.grid.wrapper.find('.grid-row-check').hide();
                frm.fields_dict.options.grid.wrapper.find('.grid-footer').hide();
                frm.fields_dict.options.grid.df.read_only = 1;
                frm.fields_dict.options.grid.refresh();
            }
        }

        if (frm.doc.status !== "Closed") {
            frm.add_custom_button('Launch', () => {
                frm.set_value('status', 'Open').then(() => frm.save());
            }, 'Poll Actions');
        
            frm.add_custom_button('Re-Launch', () => {
                frm.set_value('status', 'Reopen').then(() => frm.save());
            }, 'Poll Actions');
        
            frm.add_custom_button('End', () => {
                frm.set_value('status', 'Closed').then(() => frm.save());
            }, 'Poll Actions');
        } else {
            const result_btn = frm.add_custom_button('Result', () => {
                showLeaderboardPopup(frm.docname);
            });
        
            result_btn.css({
                'background-color': '#ffffff',
                'color': '#000000',
                'border': '1px solid #000000',
                'box-shadow': 'none'
            });
        }
        

        // Reset Poll button (always visible)
        const reset_btn = frm.add_custom_button(__('Reset Poll'), () => {
            frappe.call({
                method: "antpoll.antpoll.doctype.community_poll.community_poll.reset",
                args: { docname: frm.docname },
                callback: function(r) {
                    if (r.message) {
                        frappe.msgprint(__('Poll has been reset successfully.'));
                    } else {
                        frappe.msgprint(__('An error occurred while resetting the poll.'));
                    }
                }
            });
        });
        reset_btn.css({
            'background-color':'black',
            'color': '#FFFFFF',
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

        
    },
    before_save: function(frm) {
        if (frm.doc.questions && frm.doc.questions.length > 0) {
            const promises = [];
            frm.doc.questions.forEach(row => {
                if (row.question) {
                    // Create a promise for each API call
                    const p = frappe.call({
                        method: "antpoll.antpoll.doctype.community_poll.community_poll.get_view_count",
                        args: {
                            poll_id: frm.doc.name,
                            question_id: row.question
                        }
                    }).then(r => {
                        if (r.message !== undefined && row.total_view !== r.message) {
                            frappe.model.set_value(row.doctype, row.name, "total_view", r.message);
                        }
                    });
                    promises.push(p);
                }
            });
            // Return a promise to delay save until all are done
            return Promise.all(promises);
        }
    }
});

frappe.ui.form.on('Question Items', {
    form_render(frm, cdt, cdn) {
        const d = locals[cdt][cdn];

        if (d.name && frm.doc.name && d.question) {
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
    },
    
});

function showLeaderboardPopup(pollname) {
    console.log("showLeaderboardPopup called for", pollname);

    const dialog = new frappe.ui.Dialog({
        title: `Top Energy Earners`,
        fields: [{ fieldname: "container", label: "Leaderboard", fieldtype: "HTML" }],
        primary_action_label: "Close",
        primary_action: function() {
            dialog.hide();
        },
        size: "large"
    });
    dialog.show();
    dialog.$wrapper.find(".modal-dialog").css("max-width", "900px");

    const $wrapper = dialog.fields_dict.container.$wrapper;
    $wrapper.html(`
        <div style="padding:12px; font-family: system-ui;">
            <div id="status" style="margin-bottom:8px; font-weight:600;">Loading leaderboard...</div>
            <div id="leaderboard-content" style="max-height:450px; overflow:auto;"></div>
            <div id="no-data" style="display:none; color:#a00; font-style:italic; margin-top:10px;">No energy points found for this poll.</div>
        </div>
        <style>
          .bar-row {
            display: flex;
            align-items: center;
            padding: 8px 0;
            gap: 8px;
          }
          .bar-rank {
            width: 30px;
            font-weight: 600;
            flex-shrink: 0;
          }
          .bar-name {
            flex: 1;
            min-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 500;
            margin-right: 4px;
          }
          .bar-wrapper {
            flex: 2;
            position: relative;
            height: 24px;
            background: #f5f5f5;
            border-radius: 6px;
            overflow: hidden;
            display: flex;
            align-items: center;
          }
          .bar-fill {
            background: #000;
            height: 100%;
            border-radius: 6px 0 0 6px;
            position: relative;
            display: flex;
            align-items: center;
            padding-left: 8px;
            box-sizing: border-box;
            min-width: 30px;
          }
          .bar-points {
            position: absolute;
            left: 8px;
            color: #ffffff;
            font-weight: 600;
            font-size: 12px;
            white-space: nowrap;
          }
        </style>
    `);

    function showError(msg) {
        $wrapper.find("#status").hide();
        $wrapper.find("#leaderboard-content").hide();
        $wrapper.find("#no-data").show().text(msg);
    }

    frappe.call({
        method: "antpoll.antpoll.doctype.community_poll.community_poll.get_custom_leaderboard",
        args: {
            community_poll: pollname,
            limit: 20
        },
        callback: function(r) {
            $wrapper.find("#status").hide();

            if (r.exc) {
                showError("Server error while fetching leaderboard.");
                console.error(r);
                return;
            }

            const data = r.message;
            if (!Array.isArray(data) || data.length === 0) {
                showError("No energy points found for this poll.");
                return;
            }

            const maxPoints = Math.max(...data.map(d => d.value), 1);

            let html = "";
            data.forEach((d, idx) => {
                const rank = idx + 1;
                const nameEsc = $('<div>').text(d.name).html();
                const pts = d.value;
                const pct = Math.max((pts / maxPoints) * 100, 5); // ensure small bars visible
                html += `
                  <div class="bar-row">
                    <div class="bar-rank">${rank}</div>
                    <div class="bar-name">${nameEsc}</div>
                    <div class="bar-wrapper">
                      <div class="bar-fill" style="width: ${pct}%;">
                        <div class="bar-points">${pts}</div>
                      </div>
                    </div>
                  </div>
                `;
            });

            $wrapper.find("#leaderboard-content").html(html);
        },
        error: function(err) {
            showError("Failed to load leaderboard.");
            console.error("frappe.call error:", err);
        }
    });
}
