#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <memory>
#include <unordered_map>

using namespace std;

struct Task { int w; double orig_v; string id; bool scheduled = false; };
struct Corridor { int day_id; int cap; double freight; };

int main() {
    ios_base::sync_with_stdio(false); cin.tie(NULL);
    
    int M, N, safety_buffer_mins = 60;
    if (!(cin >> M >> N >> safety_buffer_mins)) return 0;
    double safety_buffer_hrs = safety_buffer_mins / 60.0;

    unordered_map<string, vector<Corridor>> section_corridors;
    for (int i = 0; i < M; ++i) {
        string sec_id; Corridor c;
        cin >> sec_id >> c.day_id >> c.cap >> c.freight;
        section_corridors[sec_id].push_back(c);
    }

    unordered_map<string, vector<Task>> section_tasks;
    for (int i = 0; i < N; ++i) {
        Task t; string sec_id;
        cin >> t.w >> t.orig_v >> t.id >> sec_id;
        section_tasks[sec_id].push_back(t);
    }

    for (auto& [sec_id, corridors] : section_corridors) {
        auto& tasks = section_tasks[sec_id];
        int num_tasks = tasks.size();
        if (num_tasks == 0) continue;

        for (const auto& c : corridors) {
            int W = static_cast<int>(c.cap - safety_buffer_hrs);
            if (W < 0) W = 0;
            double freight_penalty = c.freight * 20.0;
            
            vector<int> avail;
            for (int i = 0; i < num_tasks; ++i) {
                if (!tasks[i].scheduled && tasks[i].w <= W) avail.push_back(i);
            }
            if (avail.empty()) continue;

            size_t buf_size = (avail.size() + 1) * (W + 1);
            auto dp = make_unique<int[]>(buf_size);
            auto get_idx = [&](int i, int w) { return i * (W + 1) + w; };

            for (size_t i = 1; i <= avail.size(); ++i) {
                int t_idx = avail[i - 1];
                int w_i = tasks[t_idx].w;
                int v_i = max(1, static_cast<int>((tasks[t_idx].orig_v - freight_penalty) * 1000));

                for (int w = 0; w <= W; ++w) {
                    if (w_i <= w) dp[get_idx(i, w)] = max(dp[get_idx(i - 1, w)], dp[get_idx(i - 1, w - w_i)] + v_i);
                    else dp[get_idx(i, w)] = dp[get_idx(i - 1, w)];
                }
            }

            int curr_w = W;
            for (int i = avail.size(); i > 0; --i) {
                if (dp[get_idx(i, curr_w)] != dp[get_idx(i - 1, curr_w)]) {
                    int t_idx = avail[i - 1];
                    tasks[t_idx].scheduled = true;
                    curr_w -= tasks[t_idx].w;
                    cout << tasks[t_idx].id << ":" << c.day_id << " ";
                }
            }
        }
    }

    cout << endl; 
}