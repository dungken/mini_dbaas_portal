### [Board: Sprint 3 (Tuần 3) - Triển khai Vai trò Developer & Tenant Admin](https://trello.com/invite/b/691596ee5fc4a30458cd0ca7/ATTIfd017c9ec58d1ac02ce6d2b09735eb5087C7C350/sprint-3-tuần-3-triển-khai-vai-tro-developer-tenant-admin)

**Mục tiêu Sprint 3:** Hoàn thành các tính năng cho vai trò "Developer" (DML, DDL, Quản lý Instance) và "Tenant Admin" (Quản lý User, Metrics cơ bản), dựa trên nền tảng RBAC (Role-Based Access Control).

#### Epic 1: [Backend] 🛡️ (Nền tảng RBAC - Role-Based Access Control)

* `[BE/Core]` Cập nhật Middleware `require_auth` (Axum): Đảm bảo nó đọc `role` (vai trò) từ JWT và lưu vào context của request.
* `[BE/Core]` Tạo Middleware `require_role` mới: (ví dụ: `axum::middleware::from_fn_with_state`) có thể nhận tham số (vd: `Role::Developer`) và trả về lỗi 403 Forbidden nếu vai trò của user không đủ.
* `[BE/DB]` Cập nhật Bảng `Users`: Đảm bảo logic Đăng ký (Sprint 1) gán vai trò 'Viewer' một cách chính xác.
* `[BE/DB]` Viết script (SQL) thủ công để nâng cấp tài khoản test của bạn lên vai trò 'Developer' và 'Tenant Admin' trong CSDL (`management_db.UserTenantRoles`) để kiểm thử.

#### Epic 2: [Backend] ✍️ (Query Service - "Developer" DML)

* `[BE/Query]` Tạo API `POST /api/v1/query/dml` (Execute DML Queries).
* `[BE/Query]` Áp dụng Middleware `require_role(Role::Developer)` cho API DML.
* `[BE/Query]` Logic `POST /query/dml`: Phải sử dụng `Pool` của tenant (từ "Pool Manager" của Sprint 2) để thực thi.
* `[BE/Query]` Xử lý kết quả DML: Trả về JSON (ví dụ: `{"status": "ok", "rows_affected": 1}`) thay vì một tập dữ liệu.
* `[BE/Log]` Tích hợp `AuditLogs`: Ghi log "User X executed DML query".
* `[BE/Log]` Tích hợp `QueryHistory`: Ghi lại query DML và thời gian thực thi.

#### Epic 3: [Backend] 🏗️ (Query Service - "Developer" DDL)

* `[BE/Query]` Tạo API `POST /api/v1/query/ddl` (Execute DDL Queries).
* `[BE/Query]` Áp dụng Middleware `require_role(Role::Developer)` cho API DDL.
* `[BE/Query]` Logic `POST /query/ddl`: Tương tự, phải dùng `Pool` của tenant (Sprint 2) để thực thi (vd: `CREATE TABLE...`).
* `[BE/Query]` Xử lý kết quả DDL: Trả về JSON (ví dụ: `{"status": "ok", "message": "Table 'new_table' created"}`).
* `[BE/Log]` Tích hợp `AuditLogs`: Ghi log "User X executed DDL query (CREATE TABLE...)".
* `[BE/Log]` Tích hợp `QueryHistory`: Ghi lại query DDL.

#### Epic 4: [Backend] ♻️ (Quản lý Instance - Mocked)

* `[BE/DB]` Tạo API `DELETE /api/v1/instances/:id` (Delete DB Instance).
* `[BE/DB]` Logic `DELETE /instances`:
    1.  Áp dụng `require_role(Role::Developer)`.
    2.  Đọc `DatabaseInstances` để lấy tên schema/user CSDL của tenant.
    3.  Thực thi `DROP DATABASE ...;` và `DROP USER ...;` (dùng user admin của Axum).
    4.  Xóa hàng trong bảng `DatabaseInstances`.
* `[BE/DB]` Tạo API `POST /api/v1/instances/:id/toggle` (Start/Stop DB Instance).
* `[BE/DB/Mock]` **(MOCK)** Logic `POST /toggle`:
    1.  Áp dụng `require_role(Role::Developer)`.
    2.  Không gọi AWS. Chỉ cập nhật cột `status` trong bảng `DatabaseInstances` (ví dụ: từ 'active' sang 'stopped').
* `[BE/Core]` Cập nhật "Pool Manager" (Sprint 2): Trước khi cấp `Pool`, phải kiểm tra `DatabaseInstances.status`. Nếu là 'stopped', trả về lỗi "Instance is stopped".

#### Epic 5: [Backend] 🧑‍🤝‍🧑 (User Management - "Tenant Admin")

* `[BE/User]` Xây dựng `User Service` (dưới dạng `axum::Router`).
* `[BE/User/Mock]` API `POST /api/v1/users/invite` (Invite Users):
    1.  Áp dụng `require_role(Role::TenantAdmin)`.
    2.  Tạo một hàng trong bảng `Invitations` với một `invitation_token` ngẫu nhiên, `tenant_id` của admin, và `role` được mời.
    3.  **(MOCK)** `println!("[INVITE LINK]: .../accept-invite?token={token}")`.
* `[BE/User]` Tạo API `GET /api/v1/tenant/users` (Liệt kê user trong tenant).
* `[BE/User]` Tạo API `PUT /api/v1/tenant/users/:id/role` (Manage User Roles):
    1.  Áp dụng `require_role(Role::TenantAdmin)`.
    2.  Logic: Cập nhật bảng `UserTenantRoles`.
* `[BE/User]` Tạo API `DELETE /api/v1/tenant/users/:id` (Deactivate User):
    1.  Áp dụng `require_role(Role::TenantAdmin)`.
    2.  Logic: Cập nhật `Users.status` = 'inactive'.

#### Epic 6: [Backend] 📈 (Metrics Service - "Tenant Admin")

* `[BE/Admin]` Xây dựng `Admin Service` (tối thiểu, dạng `axum::Router`).
* `[BE/Admin]` Tạo API `GET /api/v1/metrics/tenant` (View System Metrics).
* `[BE/Admin]` Áp dụng `require_role(Role::TenantAdmin)`.
* `[BE/Admin]` Logic `GET /metrics`: Truy vấn `QueryHistory` và `AuditLogs`, `COUNT(*)` các hàng thuộc `tenant_id` của admin. Trả về JSON (ví dụ: `{"total_queries": 150, "total_logs": 300}`).

#### Epic 7: [Frontend] 🎨 (Nâng cấp UI cho "Developer") ✅

* ✅ `[FE/Core]` `authStore` (Zustand) đã lưu trữ `role` của user trong `user` object (từ JWT payload).
* ✅ `[FE/Core]` Tạo component `WithRole` tại `src/components/auth/WithRole.tsx` để ẩn/hiện UI dựa trên role (`WithRole({ roles: ['Developer'], children: ... })`).
* ✅ `[FE/Query]` Cập nhật `Query Editor` tại `src/components/query-editor/QueryEditor.tsx`:
    * ✅ Tự động phát hiện loại query (SELECT, DML, DDL) bằng hàm `detectQueryType()`.
    * ✅ Gọi đúng API (`/query/select`, `/query/dml`, `/query/ddl`) dựa trên loại query.
    * ✅ Hiển thị query type badge (SELECT/DML/DDL).
    * ✅ Kiểm tra role permissions (chỉ Developer/TenantAdmin/admin có thể chạy DML/DDL).
* ✅ `[FE/Table]` Cập nhật `Table Viewer` tại `src/components/query-editor/QueryResult.tsx`: Xử lý kết quả DML/DDL (hiển thị "Query OK, 2 rows affected" hoặc "Table created successfully") với màu sắc phù hợp.
* ✅ `[FE/Explorer]` Cập nhật `DB Explorer` tại `src/components/db-explorer/DatabaseTree.tsx`: Thêm nút "Refresh Schema" để gọi lại `GET /schema`.

#### Epic 8: [Frontend] ♻️ (UI Quản lý Instance) ✅

* ✅ `[FE/DB]` Cập nhật trang `/instances` tại `src/app/(admin)/instances/page.tsx`.
* ✅ `[FE/DB]` Thêm nút "Delete" và "Start/Stop" vào danh sách instance (chỉ hiển thị cho Developer/TenantAdmin/admin).
* ✅ `[FE/DB]` Tích hợp API `DELETE /instances/:id` và `POST /instances/:id/toggle` (với mock data fallback) trong `src/lib/api/dbService.ts`.
* ✅ `[FE/DB]` Hiển thị `status` ('active', 'stopped') với badge màu sắc trong danh sách instance.
* ⏳ `[FE/Query]` (Cải tiến) Vô hiệu hóa nút "Run" trong `Query Editor` nếu instance có `status` là 'stopped' - **TODO: cần tích hợp instance selection**.

#### Epic 9: [Frontend] 🧑‍🤝‍🧑 (UI Quản lý User - "Tenant Admin") ✅

* ✅ `[FE/User]` Xây dựng Module `User Management` tại `src/app/(admin)/users/page.tsx`.
* ✅ `[FE/User]` Tạo trang mới `/users`, bảo vệ bằng `WithRole({ roles: ['TenantAdmin', 'admin'], ... })`.
* ✅ `[FE/User]` Tích hợp API `GET /tenant/users` (với mock data fallback) trong `src/lib/api/userService.ts`.
* ✅ `[FE/User]` Xây dựng UI (Form/Modal) "Invite User" (Tích hợp `POST /users/invite` với mock data).
* ✅ `[FE/User]` Xây dựng UI (Dropdown/Select) "Manage Roles" (Tích hợp `PUT /tenant/users/:id/role`).
* ✅ `[FE/User]` Xây dựng UI (Button) "Deactivate User" (Tích hợp `DELETE /tenant/users/:id`).

#### Epic 10: [Frontend] 📈 (UI Dashboard Metrics - "Tenant Admin") ✅

* ✅ `[FE/Admin]` Xây dựng Module `Admin Dashboard` tại `src/app/(admin)/admin-dashboard/page.tsx`.
* ✅ `[FE/Admin]` Tạo trang mới `/admin-dashboard`, bảo vệ bằng `WithRole({ roles: ['TenantAdmin', 'admin'], ... })`.
* ✅ `[FE/Admin]` Tích hợp API `GET /api/v1/metrics/tenant` (với mock data fallback) trong `src/lib/api/metricsService.ts`.
* ✅ `[FE/Admin]` Hiển thị các chỉ số cơ bản dưới dạng Card metrics (Total Queries, Total Logs, Total Instances, Active Users).