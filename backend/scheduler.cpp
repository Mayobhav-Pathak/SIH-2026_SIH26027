#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <queue>
#include <set>
#include <unordered_map>

using namespace std;

struct Task { 
    string id; 
    double duration_hrs; 
    int defect_severity; 
    int days_overdue; 
    int duration_mins() const { return static_cast<int>(duration_hrs * 60); }
};

struct Train { 
    string id; 
    int day_id; 
    int entry_hour; 
    int exit_hour; 
    int entry_min() const { return entry_hour * 60; }
    int exit_min() const { return exit_hour * 60; }
};

struct TimeGap { 
    int start_min; 
    int end_min; 
    int day_id;
    int available_mins() const { return end_min - start_min; }
    bool operator<(const TimeGap& other) const { return available_mins() < other.available_mins(); }
};

struct AlphaScoreComparator {
    bool operator()(const Task& a, const Task& b) const {
        double scoreA = (10.0 * a.defect_severity) + (2.5 * a.days_overdue) + (1.0 / max(0.1, a.duration_hrs));
        double scoreB = (10.0 * b.defect_severity) + (2.5 * b.days_overdue) + (1.0 / max(0.1, b.duration_hrs));
        return scoreA < scoreB; 
    }
};

int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    
    int num_trains, num_tasks, safety_buffer_mins;
    if (!(cin >> num_trains >> num_tasks >> safety_buffer_mins)) return 0;

    unordered_map<string, vector<Train>> section_trains;
    for (int i = 0; i < num_trains; ++i) {
        Train tr; string sec_id;
        cin >> tr.id >> sec_id >> tr.day_id >> tr.entry_hour >> tr.exit_hour;
        section_trains[sec_id].push_back(tr);
    }

    unordered_map<string, vector<Task>> section_tasks;
    for (int i = 0; i < num_tasks; ++i) {
        Task t; string sec_id;
        cin >> t.id >> sec_id >> t.duration_hrs >> t.defect_severity >> t.days_overdue;
        section_tasks[sec_id].push_back(t);
    }

    for (auto& [sec_id, tasks] : section_tasks) {
        priority_queue<Task, vector<Task>, AlphaScoreComparator> execution_tape;
        for (const auto& t : tasks) execution_tape.push(t);

        auto& trains = section_trains[sec_id];

        for (int day = 1; day <= 60; ++day) {
            if (execution_tape.empty()) break;

            vector<Train> daily_trains;
            for (const auto& tr : trains) {
                if (tr.day_id == day) daily_trains.push_back(tr);
            }

            sort(daily_trains.begin(), daily_trains.end(), [](const Train& a, const Train& b) {
                return a.entry_min() < b.entry_min();
            });

            multiset<TimeGap> safe_gaps;
            int current_time = 0;
            const int END_OF_DAY = 1440;
            
            for (const auto& tr : daily_trains) {
                int physical_gap = tr.entry_min() - current_time;
                if (physical_gap > safety_buffer_mins) {
                    safe_gaps.insert({current_time + (safety_buffer_mins / 2), tr.entry_min() - (safety_buffer_mins / 2), day});
                }
                current_time = max(current_time, tr.exit_min());
            }
            if (END_OF_DAY - current_time > safety_buffer_mins) {
                safe_gaps.insert({current_time + (safety_buffer_mins / 2), END_OF_DAY - (safety_buffer_mins / 2), day});
            }

            vector<Task> unmatched;
            while (!execution_tape.empty() && !safe_gaps.empty()) {
                Task top_task = execution_tape.top();
                execution_tape.pop();

                TimeGap req = {0, top_task.duration_mins(), day};
                auto it = safe_gaps.lower_bound(req); 

                if (it != safe_gaps.end()) {
                    TimeGap matched = *it;
                    safe_gaps.erase(it);
                    
                    int task_end_min = matched.start_min + top_task.duration_mins();
                    
                    // THIS IS THE CRITICAL LINE THAT PYTHON IS WAITING FOR
                    cout << top_task.id << ":" << day << ":" << matched.start_min << ":" << task_end_min << " ";
                    
                    int leftover = matched.available_mins() - top_task.duration_mins();
                    if (leftover > 0) {
                        safe_gaps.insert({matched.start_min + top_task.duration_mins(), matched.end_min, day});
                    }
                } else {
                    unmatched.push_back(top_task);
                }
            }
            
            for (const auto& t : unmatched) execution_tape.push(t);
        }
    }
    cout << endl; 
    return 0;
}