
# 🗳️ antPOLL

### <span style="color:purple">Polling App</span>


**antPOLL** is an interactive quiz and polling app built on the powerful Frappe framework. It allows you to create time-based, multiple-choice polls with real-time leaderboards based on accuracy and speed. Designed for learning, engagement, and competition, Ant-POLL is perfect for internal trainings, team contests, educational institutions, and community engagement.

---

## 🚀<span style="color:green">Features</span>

- ✅ **Multiple Choice Questions**  
  Create polls using single-answer multiple choice questions, with correct answer validation.

- ⏱️ **Time-Based Scoring**  
  Users get more points for answering correctly and quickly.

- 📊 **Leaderboard System**  
  Real-time leaderboard ranks participants by score and response time.

- 📈 **Graphical Result Visualization**  
  Admins can view poll results in the form of dynamic horizontal bar graphs.

- 🔁 **Multiple Polls per Day**  
  Run multiple polls on the same day — each with a separate leaderboard and results.

- 🧑‍💻 **Participant History**  
  Tracks all polls attended by users and their performance.

---

## 🛠️ <span style="color:green">Installation</span>


> **Dependency:**
> 
> - `qrcode==8.1`

**Follow these steps to install Ant-POLL on your ERPNext/Frappe site:**

```bash
# Step 1: Navigate to your Frappe bench directory
cd ~/frappe-bench
```
```
# Step 2: Get the Ant-POLL app from GitHub
bench get-app antpoll https://github.com/anthertech/antPOLL.git
```
```
# Step 3: Install the app to your site
bench --site yoursite.com install-app antpoll
```
```
# Step 4: Build the site assets (recommended)
bench --site yoursite.com build
```
```
# Step 5: Run migration (recommended)
bench --site yoursite.com migrate
```
---

## 📦 <span style="color:green">Usage</span>

    🔹Enable Leaderboard

        Go to Energy Point Settings and enable "Leaderboard".

    🔹Configure Poll Settings

        Set the Question Timer and Redirection Timer in Poll Settings.

    🔹Add Poll Questions

        Add questions with multiple options.

        Enable the correct answer using the checkbox.

    🔹Create a Community Poll

        Use the questions to create a Community Poll.

    🔹Launch the Poll

        Go to the Community Poll Web Page, and click "Launch Poll" via the Poll Actions.

    🔹Track Results

        Admins can monitor results using the leaderboard and graphical reports.
---
## 🔮<span style="color:green">Future Enhancements</span>

    📝 Multiple Answer Questions
    Support for questions with more than one correct option.

    ⭐ Rating-Based Questions
    Let users rate a topic instead of selecting predefined options.

    🧩 Question Type Categories
    Support for configuring poll types like single-answer, multi-answer, and rating-based.

    🛠️ Advanced Customization
    More control over poll behavior, layout, and timer settings.

    📱 Mobile-Friendly Interface
    Integration with Ionic or responsive UI for a clean mobile experience.

    ⚡ Performance Optimization
    Better background handling, caching, and scalability for high user loads.

---
## 🤝<span style="color:green">Contributions</span>

We welcome community contributions!

Feel free to:

    🐞 Submit issues and bug reports

    ✨ Suggest improvements and features

    📦 Open pull requests

👉 Contribute on GitHub
📄 License
---
Poll App is released under the MIT License — free to use and modify for personal or commercial projects.
📬 Contact & Support

Have questions or need help?

    🔗 GitHub: github.com/anthertech/pollapp
