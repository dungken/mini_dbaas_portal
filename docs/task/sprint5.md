### [Board: Sprint 5 (Tuần 5) - Hoàn thiện, Logging & Sửa lỗi (Polish, Logging & Bug Bash)](https://trello.com/invite/b/69159be76126f68263093242/ATTIa78c8537dfb3f9fc2f648d89076951288BA134D3/sprint-5-tuần-5-hoan-thiện-logging-sửa-lỗi-polish-logging-bug-bash)

**Mục tiêu Sprint 5:** Hoàn thành các tính năng xuyên suốt (Audit Log, Metrics), triển khai Soft Delete và User Preferences, sửa lỗi từ các sprint trước, và chuẩn bị cho demo cuối cùng.

### Column: `Backlog Sprint (Tuần 5)`

#### Epic 1: [Backend] 🛡️ (Hoàn thiện Audit Logging)

* `[BE/Log]` Rà soát `Auth Service`: Đảm bảo các sự kiện `Login` (thành công/thất bại), `Register`, `ResetPassword` được ghi vào bảng `AuditLogs`.
* `[BE/Log]` Rà soát `Admin Service`: Đảm bảo `ManageTenants`, `SetQuotas`, `ConfigSystem` được ghi vào `AuditLogs`.
* `[BE/Log]` Rà soát `User Service`: Đảm bảo `InviteUser`, `ManageRoles`, `DeactivateUser` được ghi vào `AuditLogs`.
* `[BE/Log]` Rà soát `DB Service`: Đảm bảo `CreateDB`, `DeleteDB`, `ToggleDB` được ghi vào `AuditLogs`.
* `[BE/Log]` Cập nhật logic ghi log: Bổ sung `ip_address` và `session_information` (từ JWT/header) vào `AuditLogs`.

#### Epic 2: [Backend] 📈 (Hoàn thiện Performance Monitoring)

* `[BE/Metrics]` Cập nhật `Query Service` (Sprint 2): Ghi lại `execution_time` và `result_set_size` vào bảng `Metrics` sau mỗi truy vấn.
* `[BE/Metrics]` Cập nhật "Pool Manager" (Sprint 2): Ghi lại `connection_pool_statistics` (vd: số kết nối hoạt động) vào bảng `Metrics` theo định kỳ (vd: mỗi 5 phút dùng `tokio::spawn`).
* `[BE/Metrics]` (Nâng cao) Viết một "Background Job" (dùng `tokio::spawn`) để tổng hợp (aggregate) metrics (ví dụ: từ phút -> giờ) để tối ưu hiển thị.

#### Epic 3: [Backend] 🗑️ (Triển khai Soft Delete)

* `[BE/DB]` Rà soát migration: Đảm bảo các bảng chính (`Users`, `Tenants`, `DatabaseInstances`...) có cột `deleted_at`.
* `[BE/Core]` Cập nhật các hàm `DELETE`: Thay thế logic `DELETE FROM ...` bằng `UPDATE ... SET deleted_at = NOW() WHERE ...`.
* `[BE/Core]` Cập nhật các hàm `SELECT`: Thêm `WHERE deleted_at IS NULL` vào tất cả các truy vấn `SELECT` (vd: `get_users_in_tenant`, `get_instances`...).
* `[BE/Core]` Cập nhật API `Deactivate User` (Sprint 3): Sử dụng `soft delete` cho bảng `Users` thay vì đổi `status`.

#### Epic 4: [Backend] ⚙️ (Hoàn thiện User Preferences)

* `[BE/User]` Tạo API `GET /api/v1/users/me/preferences` (đọc bảng `UserPreferences`).
* `[BE/User]` Tạo API `PUT /api/v1/users/me/preferences` (cập nhật `UserPreferences`).
* `[BE/User]` Logic: Dùng `INSERT ... ON DUPLICATE KEY UPDATE` cho bảng `UserPreferences` (với `user_id` làm khóa chính hoặc khóa duy nhất).
* `[BE/User]` Cập nhật API `GET /users/me` (Sprint 1): Trả về thông tin `first_name`, `last_name`... (theo `erd.md`).
* `[BE/User]` Tạo API `PUT /api/v1/users/me` (cập nhật `first_name`, `last_name`...).

#### Epic 5: [Frontend] 🎨 (Hoàn thiện UI "Manage Profile") ✅

* ✅ `[FE/User]` Cập nhật trang `Manage Profile` (từ Sprint 1) tại `src/app/(admin)/(others-pages)/profile/page.tsx`.
* ✅ `[FE/User]` Thêm Form "Cập nhật Thông tin" (`first_name`, `last_name`, `phone`, `bio`) trong `src/components/user-profile/UserInfoCard.tsx` và tích hợp API `PUT /users/me` (với mock data fallback) trong `src/lib/api/userService.ts`.
* ✅ `[FE/User]` Thêm Form "Tùy chỉnh" (`notification_preferences`, `default_theme`, `email_notifications`) trong `src/components/user-profile/UserPreferencesCard.tsx`.
* ✅ `[FE/User]` Tích hợp API `GET`/`PUT /users/me/preferences` (với mock data fallback) trong `src/lib/api/userService.ts`.
* ✅ `[FE/User]` Form "Đổi mật khẩu" đã có sẵn từ Sprint 1 (ChangePasswordCard).

#### Epic 6: [Frontend] 📊 (Hoàn thiện Dashboard Metrics) ✅

* ✅ `[FE/Admin]` Cập nhật Dashboard (Tenant Admin) (Sprint 3) tại `src/app/(admin)/admin-dashboard/page.tsx`.
* ✅ `[FE/Admin]` Tích hợp thư viện biểu đồ `recharts` (đã cài đặt).
* ✅ `[FE/Admin]` Tạo API `GET /metrics/tenant/charts` (với mock data fallback) trong `src/lib/api/metricsService.ts`.
* ✅ `[FE/Admin]` Hiển thị biểu đồ "Query execution time" (LineChart) và "Resource utilization" (AreaChart) với ResponsiveContainer.
* ✅ `[FE/Admin]` (Super Admin) Cập nhật Dashboard (Super Admin) có thể sử dụng `metricsService.getSystemMetrics()` và `metricsService.getSystemCharts()` (API endpoints: `/api/v1/admin/metrics` và `/api/v1/admin/metrics/charts`).

#### Epic 7: [Frontend] 🛡️ (Hoàn thiện UI Audit Log) ✅

* ⏳ `[BE/Admin]` Tạo API `GET /api/v1/audit-logs` (cho Tenant Admin, chỉ thấy log tenant của mình) - **TODO: Backend**.
* ⏳ `[BE/Admin]` Tạo API `GET /api/v1/admin/audit-logs` (cho Super Admin, thấy tất cả) - **TODO: Backend**.
* ✅ `[FE/Admin]` Tạo trang mới `/audit-logs` tại `src/app/(admin)/audit-logs/page.tsx` (bảo vệ bằng `WithRole({ roles: ['TenantAdmin', 'SuperAdmin', 'admin'], ... })`).
* ✅ `[FE/Admin]` Hiển thị `AuditLogs` trong một bảng (table) với phân trang (pagination) và lọc (filter: action, resource_type, start_date, end_date).
* ✅ `[FE/Admin]` Tích hợp API `GET /api/v1/audit-logs` và `GET /api/v1/admin/audit-logs` (với mock data fallback) trong `src/lib/api/auditLogService.ts`.

#### Epic 8: [Hệ thống] 🐛 (Sửa lỗi - Bug Bash)

* `[Test]` Thực hiện kiểm thử E2E (End-to-End) toàn diện cho cả 4 vai trò.
* `[Test]` (E2E) Luồng 1: Super Admin -> Tạo Tenant -> Mời Tenant Admin.
* `[Test]` (E2E) Luồng 2: Tenant Admin -> Mời Developer.
* `[Test]` (E2E) Luồng 3: Developer -> Tạo Instance -> Chạy DDL/DML -> Xóa Instance.
* `[Test]` (E2E) Luồng 4: Viewer -> Đăng nhập -> Chỉ thấy `SELECT`.
* `[Bug]` (Task) Sửa lỗi: Lỗi X (ví dụ: "Nút bấm bị lệch").
* `[Bug]` (Task) Sửa lỗi: Lỗi Y (ví dụ: "Đăng xuất không xóa token").
* `[Bug]` (Task) Sửa lỗi: Lỗi Z (ví dụ: "Query DML không hiển thị đúng thông báo").

#### Epic 9: [Hệ thống] ✨ (Hoàn thiện - Polish)

* `[FE/UI]` Rà soát toàn bộ UI, đảm bảo tính nhất quán (consistent) (font, màu sắc, padding).
* `[FE/UI]` Thêm `loading spinners` (biểu tượng tải) cho tất cả các lần gọi API (vd: `Login`, `Run Query`...).
* `[FE/UI]` Rà soát các thông báo lỗi, đảm bảo chúng thân thiện (Error Handling).
* `[FE/UI]` Đảm bảo UI có tính "responsive" (thích ứng) cơ bản (vd: trên tablet).
* `[Docs]` Viết file `README.md` hướng dẫn cách chạy dự án (cả backend và frontend).

#### Epic 10: [DevOps] 🚀 (Chuẩn bị Demo & "Ra mắt")

* `[DevOps/BE]` Rà soát file `.env` (biến môi trường), đảm bảo tất cả `secret keys` (JWT, Encryption) là strong (mạnh).
* `[DevOps/RDS]` Lên kế hoạch và thực hiện backup CSDL (`management_db`) lần đầu.
* `[DevOptions/BE]` Cấu hình Nginx trên EC2 để phục vụ cả React (từ S3 hoặc build tĩnh) và Axum (reverse proxy) một cách tối ưu.
* `[Demo]` Chuẩn bị kịch bản demo cuối cùng, bao gồm tất cả 4 vai trò và các tính năng chính.
* `[Cleanup]` Dọn dẹp code, xóa các file "mock" tạm thời (ví dụ: ô input dán token ở frontend Sprint 1).