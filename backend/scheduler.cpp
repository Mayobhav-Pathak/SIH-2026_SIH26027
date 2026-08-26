#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
#include <unordered_map>

using namespace std;

struct Task { 
    int w; 
    double orig_v; 
    string id; 
    bool scheduled = false; 
};

struct Corridor { 
    int day_id;
    int cap; 
    double freight; 
};

int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    
    int M, N;
    if (!(cin >> M >> N)) return 0;

    // Use hash maps for O(1) spatial bucketing by track section
    unordered_map<string, vector<Corridor>> section_corridors;
    for (int i = 0; i < M; ++i) {
        string sec_id;
        Corridor c;
        cin >> sec_id >> c.day_id >> c.cap >> c.freight;
        section_corridors[sec_id].push_back(c);
    }

    unordered_map<string, vector<Task>> section_tasks;
    for (int i = 0; i < N; ++i) {
        Task t;
        string sec_id;
        cin >> t.w >> t.orig_v >> t.id >> sec_id;
        section_tasks[sec_id].push_back(t);
    }

    // Process each physical track section independently
    for (auto& [sec_id, corridors] : section_corridors) {
        auto& tasks = section_tasks[sec_id];
        int num_tasks = tasks.size();
        if (num_tasks == 0) continue;

        // Iterate through timetable gaps (corridors) for this specific section
        for (const auto& c : corridors) {
            int W = c.cap;
            double freight_penalty = c.freight * 20.0;
            
            vector<int> available_indices;
            for (int i = 0; i < num_tasks; ++i) {
                if (!tasks[i].scheduled && tasks[i].w <= W) {
                    available_indices.push_back(i);
                }
            }
            
            int num_avail = available_indices.size();
            if (num_avail == 0) continue;

            // 1D Contiguous Buffer Allocation
            size_t buffer_size = (num_avail + 1) * (W + 1);
            auto dp_buffer = make_unique<int[]>(buffer_size);
            auto get_idx = [&](int i, int w) { return i * (W + 1) + w; };

            for (int i = 1; i <= num_avail; ++i) {
                int task_idx = available_indices[i - 1];
                int w_i = tasks[task_idx].w;
                int v_i = static_cast<int>((tasks[task_idx].orig_v - freight_penalty) * 1000);
                if (v_i < 0) v_i = 1;

                for (int w = 0; w <= W; ++w) {
                    if (w_i <= w) {
                        dp_buffer[get_idx(i, w)] = max(dp_buffer[get_idx(i - 1, w)], 
                                                       dp_buffer[get_idx(i - 1, w - w_i)] + v_i);
                    } else {
                        dp_buffer[get_idx(i, w)] = dp_buffer[get_idx(i - 1, w)];
                    }
                }
            }

            int curr_w = W;
            for (int i = num_avail; i > 0; --i) {
                if (dp_buffer[get_idx(i, curr_w)] != dp_buffer[get_idx(i - 1, curr_w)]) {
                    int task_idx = available_indices[i - 1];
                    tasks[task_idx].scheduled = true;
                    curr_w -= tasks[task_idx].w;
                    
                    // Output format remains identical, so Python parser doesn't break
                    cout << tasks[task_idx].id << ":" << c.day_id << " ";
                }
            }
        }
    }
    cout << "\n";
    return 0;
}