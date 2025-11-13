### [Board: Sprint 4 (Tuần 4) - Vai trò Super Admin & Quản lý Đa (Multi-Tenancy)](https://trello.com/invite/b/691599d2480a39559f23608e/ATTIab72a689d2b559ca8eee11f456c589525CBE47CD/sprint-4-tuần-4-vai-tro-super-admin-quản-ly-da-multi-tenancy)

**Mục tiêu Sprint 4:** Hoàn thành các tính năng cho vai trò "Super Admin" (Quản lý Tenant, Đặt Quota, Cấu hình Hệ thống). Thực thi (Enforce) các giới hạn Quota và hoàn thiện luồng "Mời người dùng" (Invitation).

### Column: `Backlog Sprint (Tuần 4)`

#### Epic 1: [Backend] 👑 (Nền tảng RBAC - Super Admin)

* `[BE/Core]` Cập nhật Logic `POST /login` (Sprint 1): Đảm bảo nhận diện chính xác vai trò "Super Admin" từ bảng `Roles` và đưa vào JWT.
* `[BE/Core]` Cập nhật Middleware `require_role` (Sprint 3): Đảm bảo `require_role(Role::SuperAdmin)` hoạt động chính xác.
* `[BE/DB]` Viết script (SQL) thủ công để nâng cấp tài khoản test của bạn lên vai trò 'Super Admin' trong CSDL (`management_db.UserTenantRoles`) để kiểm thử.

#### Epic 2: [Backend] 🏢 (Admin Service - Quản lý Tenant)

* `[BE/Admin]` Tạo API `POST /api/v1/admin/tenants` (Manage Tenants - Create).
    * *Task phụ:* Áp dụng `require_role(Role::SuperAdmin)`.
    * *Task phụ:* Logic: Tạo một hàng mới trong bảng `Tenants`.
* `[BE/Admin]` Tạo API `GET /api/v1/admin/tenants` (Manage Tenants - List).
* `[BE/Admin]` Tạo API `PUT /api/v1/admin/tenants/:id` (Manage Tenants - Update).
    * *Task phụ:* Logic: Cập nhật `tenant_name` hoặc `status` ('active', 'suspended') trong bảng `Tenants`.

#### Epic 3: [Backend] 📊 (Admin Service - Quản lý Quota)

* `[BE/Admin]` Tạo API `GET /api/v1/admin/tenants/:id/quotas` (Set Resource Quotas - Get).
    * *Task phụ:* Áp dụng `require_role(Role::SuperAdmin)`.
    * *Task phụ:* Logic: Đọc bảng `ResourceQuotas` cho `tenant_id` này.
* `[BE/Admin]` Tạo API `PUT /api/v1/admin/tenants/:id/quotas` (Set Resource Quotas - Set).
    * *Task phụ:* Áp dụng `require_role(Role::SuperAdmin)`.
    * *Task phụ:* Logic: `INSERT ... ON DUPLICATE KEY UPDATE` vào bảng `ResourceQuotas` (ví dụ: `quota_type='max_users'`, `value=10`).

#### Epic 4: [Backend] 🚧 (Thực thi Quota - Enforcing)

* `[BE/Core]` **(Rất quan trọng)** Cập nhật API `POST /api/v1/instances` (Sprint 2):
    * Trước khi tạo instance, truy vấn `ResourceQuotas` và `DatabaseInstances`.
    * Nếu `COUNT(instances) >= quota.value('max_db_instances')`, trả về lỗi 403 "Database quota exceeded".
* `[BE/Core]` **(Rất quan trọng)** Cập nhật API `POST /api/v1/users/invite` (Sprint 3):
    * Trước khi tạo lời mời, truy vấn `ResourceQuotas` và `UserTenantRoles`.
    * Nếu `COUNT(users) >= quota.value('max_users')`, trả về lỗi 403 "User quota exceeded".

#### Epic 5: [Backend] ⚙️ (Cấu hình Hệ thống - System Settings)

* `[BE/DB]` Viết migration script tạo bảng `SystemSettings` (ví dụ: `key` (PK), `value`).
* `[BE/Admin]` Tạo API `GET /api/v1/admin/settings` (Configure System Settings - Get).
    * *Task phụ:* Áp dụng `require_role(Role::SuperAdmin)`.
* `[BE/Admin]` Tạo API `PUT /api/v1/admin/settings` (Configure System Settings - Set).
    * *Task phụ:* Áp dụng `require_role(Role::SuperAdmin)`.
* `[BE/Core]` Cập nhật API `POST /auth/register` (Sprint 1): Đọc `SystemSettings` (ví dụ: `password_min_length`) và áp dụng logic validation dựa trên đó.

#### Epic 6: [Backend] 📬 (Hoàn thiện Luồng Mời - Invitation Flow)

* `[BE/User]` Cập nhật API `POST /users/invite` (Sprint 3): Bỏ `println!` (mock), chỉ lưu `invitation_token` vào CSDL.
* `[BE/Auth]` Tạo API (public) `GET /auth/invite/details?token=...`:
    * Logic: Tìm `token` trong bảng `Invitations`. Trả về thông tin (vd: email được mời, tên tenant) để UI hiển thị.
* `[BE/Auth]` Tạo API (public) `POST /auth/accept-invite`:
    * Input: `token`, `first_name`, `last_name`, `password`.
    * Logic:
        1.  Xác thực `token` từ bảng `Invitations`.
        2.  Tạo user mới trong bảng `Users` (status 'active', `is_email_verified` = true).
        3.  Hash mật khẩu.
        4.  Tạo liên kết trong `UserTenantRoles` (dựa trên `tenant_id`, `role` trong `Invitations`).
        5.  Xóa `token` / hàng trong `Invitations`.

#### Epic 7: [Frontend] 👑 (Admin Dashboard - UI Super Admin)

* `[FE/Admin]` Xây dựng Module `Admin Dashboard`.
* `[FE/Admin]` Tạo trang mới `/admin`, bảo vệ bằng `WithRole("SuperAdmin")`.
* `[FE/Admin]` UI `Manage Tenants`:
    * Tích hợp `GET /admin/tenants` (Epic 2) để hiển thị bảng tenants.
    * Tạo Form/Modal "Create Tenant" và "Edit Tenant" (Tích hợp `POST`/`PUT` /admin/tenants).
* `[FE/Admin]` UI `Set Resource Quotas`:
    * Thêm nút "Manage Quotas" vào mỗi tenant.
    * Tạo Form (ví dụ: `max_users`, `max_dbs`) và tích hợp `GET`/`PUT /admin/tenants/:id/quotas` (Epic 3).
* `[FE/Admin]` UI `Configure System Settings`:
    * Tạo trang `/admin/settings`.
    * Tạo Form (ví dụ: `password_min_length`) và tích hợp `GET`/`PUT /admin/settings` (Epic 5).

#### Epic 8: [Frontend] 📬 (Hoàn thiện UI Mời - Invitation Flow)

* `[FE/User]` Cập nhật Form "Invite User" (Sprint 3): Sau khi gửi, chỉ hiển thị "Invitation Sent" (không còn mock link).
* `[FE/Auth]` Tạo trang public (layout `AuthLayout`) mới: `/accept-invite`.
* `[FE/Auth]` Logic trang `/accept-invite`:
    1.  Lấy `token` từ URL.
    2.  Gọi `GET /auth/invite/details` (Epic 6) để hiển thị (vd: "Bạn đã được mời vào Tenant X").
    3.  Hiển thị Form (password, first_name...) và gọi `POST /auth/accept-invite` (Epic 6).
    4.  Nếu thành công, tự động đăng nhập (lưu token) và redirect đến trang Dashboard.

#### Epic 9: [Frontend] 🚧 (Hiển thị Lỗi Quota - UI)

* `[FE/User]` Cập nhật Form "Invite User" (Sprint 3):
    * Bắt (catch) lỗi 403 từ API (Epic 4).
    * Hiển thị thông báo lỗi thân thiện (vd: "Không thể mời người dùng. Đã đạt giới hạn quota người dùng cho tenant này.").
* `[FE/DB]` Cập nhật Trang "Instances" (Sprint 2):
    * Bắt (catch) lỗi 403 từ API (Epic 4).
    * Hiển thị thông báo lỗi (vd: "Không thể tạo instance. Đã đạt giới hạn quota CSDL.").

#### Epic 10: [Testing] 🧪 (Kiểm thử Toàn diện)

* `[Test]` Test Case Super Admin: Login (Super Admin) -> Tạo Tenant A -> Sửa Tenant A -> Đặt Quota (max_users=2) cho Tenant A.
* `[Test]` Test Case Enforcing Quota: Login (Tenant Admin A) -> Mời user 1 (OK) -> Mời user 2 (OK) -> Mời user 3 (Thất bại, thấy thông báo lỗi Quota).
* `[Test]` Test Case Invitation Flow: Super Admin tạo Tenant B -> Mời 1 Tenant Admin B (dùng email test) -> Developer nhận link (copy/paste) -> Hoàn tất đăng ký -> Đăng nhập (với vai trò Tenant Admin B).
* `[Test]` Test Case System Settings: Super Admin đặt `password_min_length` = 10 -> Đăng xuất -> Thử đăng ký tài khoản mới (Sprint 1) với pass "123" -> Thất bại. Đăng ký với pass "1234567890" -> Thành công.