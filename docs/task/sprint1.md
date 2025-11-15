### [Board: Sprint 1 (Tuần 1) - Nền tảng & Xác thực](https://trello.com/invite/b/69157db5bb542dcfbca3822a/ATTI3638dcf60a939bb1167f05c1a3a4d07899C8C112/dự-an-dbaas-sprint-1)
#### Epic 1: [Hạ tầng AWS] 🌩️ (Provisioning)

* `[AWS/Kiểm tra]` Xác nhận các quyền của "Federated User" (voclabs).
* `[AWS/EC2]` Provision 1 EC2 instance (`t2.micro`) và cấu hình Security Group (mở port 22, 80).
* `[AWS/RDS]` Provision 1 RDS MySQL instance (`db.t2.micro`).
* `[AWS/RDS]` Cấu hình Security Group của RDS (chỉ cho phép truy cập từ EC2).
* `[AWS/S3]` Provision 1 S3 Bucket (cho React frontend build).
* `[AWS/SES]` (Thử nghiệm) Truy cập AWS SES và xác nhận đang ở chế độ "Sandbox".

#### Epic 2: [CSDL] 🗃️ (Schema & Migration)

* `[BE/DB]` Cài đặt và cấu hình `sqlx` (cho Axum) và `sqlx-cli`.
* `[BE/DB]` Tạo 2 schema trong 1 RDS: `management_db` (cho RDS-A) và `sandbox_db` (cho RDS-B).
* `[BE/DB]` Viết migration script để tạo bảng `Users`, `Tenants`, `Roles`, `UserTenantRoles`.
* `[BE/DB]` Viết migration script để tạo bảng `DatabaseInstances`, `Connections`, `QueryHistory`.
* `[BE/DB]` Viết migration script để tạo bảng `ResourceQuotas`, `AuditLogs`, `Invitations`.
* `[BE/DB]` Viết migration script để tạo bảng `UserPreferences`, `Metrics`.
* `[BE/DB]` Viết script "seed" (SQL) để chèn 4 vai trò mặc định ('Viewer', 'Developer'...) vào bảng `Roles`.

#### Epic 3: [Backend] ⚙️ (Core Axum Setup)

* `[BE/Core]` Khởi tạo dự án Rust + `axum`.
* `[BE/Core]` Cấu hình `dotenv` (.env) và struct `AppState` (cho `axum`).
* `[BE/Core]` Tích hợp `sqlx::MySqlPool` vào `AppState` (kết nối tới `management_db`).
* `[BE/Core]` Tích hợp `bcrypt` và `jsonwebtoken` vào dự án.
* `[BE/Core]` Tạo Middleware `require_auth` (dùng `axum::middleware::from_fn_with_state`) để xác thực JWT.

#### Epic 4: [Backend] 👤 (Luồng Đăng ký & Xác thực Mocked)

* `[BE/Auth/Mock]` API `POST /auth/register` (Register Account):
    * Validate password (theo `activity.md`).
    * Hash pass, Tạo `Users` (status 'pending'), `Tenants`, `UserTenantRoles`.
    * Tạo `verification_token`.
    * **(MOCK)** `println!("[VERIFY TOKEN]: {}", token)`. *Không gọi AWS SES*.
* `[BE/Auth]` API `GET /auth/verify-email`:
    * Nhận `token` từ query param.
    * Validate token, Cập nhật `Users.status` = 'active'.

#### Epic 5: [Backend] 🔑 (Luồng Đăng nhập & Reset Mocked)

* `[BE/Auth]` API `POST /auth/login` (Login):
    * Validate email/pass (dùng `bcrypt.verify`).
    * Kiểm tra `Users.status` == 'active'.
    * Tạo JWT (chứa `user_id`, `tenant_id`, `role`).
* `[BE/Auth/Mock]` API `POST /auth/forgot-password` (Reset Password - Flow 1):
    * Tìm user, tạo `password_reset_token`.
    * **(MOCK)** `println!("[RESET TOKEN]: {}", token)`. *Không gọi AWS SES*.
* `[BE/Auth]` API `POST /auth/reset-password` (Reset Password - Flow 2).

#### Epic 6: [Backend] 🧑‍💼 (Luồng Quản lý Hồ sơ)

* `[BE/User]` API `GET /users/me` (Hỗ trợ Manage Profile).
    * *Yêu cầu:* Phải được bảo vệ bằng Middleware `require_auth`.
* `[BE/User]` API `PUT /users/me/password` (Manage Profile - Change Password).
    * *Yêu cầu:* Phải được bảo vệ bằng Middleware `require_auth`.

#### Epic 7: [Frontend] 🖥️ (Core Next.js Setup) ✅

* ✅ `[FE/Core]` Khởi tạo dự án Next.js 15 + TypeScript (TailAdmin template).
* ✅ `[FE/Core]` Cài đặt state management (Zustand), `axios`.
  * **Note:** Next.js App Router không cần React Router (đã có routing built-in).
* ✅ `[FE/Core]` Tạo `AuthLayout` (public) tại `src/app/(full-width-pages)/(auth)/layout.tsx`.
* ✅ `[FE/Core]` Tạo `AdminLayout` (private) tại `src/app/(admin)/layout.tsx` với Sidebar và Header.
* ✅ `[FE/Core]` Cấu hình `axios` với JWT interceptor tại `src/lib/api/axios.ts`.
* ✅ `[FE/Core]` Tạo Zustand auth store tại `src/lib/store/authStore.ts`.
* ✅ `[FE/Core]` Tạo component `ProtectedRoute` tại `src/components/auth/ProtectedRoute.tsx` để bảo vệ routes private (đã tích hợp vào `AdminLayout`).

#### Epic 8: [Frontend] 👤 (Luồng Xác thực Mocked) ✅

* ✅ `[FE/Auth]` Module `Authentication` đã có sẵn trong template.
* ✅ `[FE/Auth]` Xây dựng trang `SignInPage` (`src/app/(full-width-pages)/(auth)/signin/page.tsx`) với `SignInForm` đã tích hợp API `POST /auth/login`.
* ✅ `[FE/Auth]` Xây dựng trang `RegisterPage` (sử dụng `SignUpForm` có sẵn) tại `src/app/(full-width-pages)/(auth)/signup/page.tsx` - Tích hợp API `POST /auth/register`.
* ✅ `[FE/Auth]` Xây dựng trang `ForgotPasswordPage` tại `src/app/(full-width-pages)/(auth)/forgot-password/page.tsx` - Tích hợp API `POST /auth/forgot-password`.
* ✅ `[FE/Auth/Mock]` Xây dựng trang `VerifyEmailPage` tại `src/app/(full-width-pages)/(auth)/verify-email/page.tsx`: Có **ô input (tạm thời)** để dán `verification_token` (lấy từ log console backend) - Tích hợp API `GET /auth/verify-email?token=...`.
* ✅ `[FE/Auth/Mock]` Xây dựng trang `ResetPasswordPage` tại `src/app/(full-width-pages)/(auth)/reset-password/page.tsx`: Nhận `token` từ URL query param và tích hợp API `POST /auth/reset-password`.

#### Epic 9: [Frontend] 🧑‍💼 (Luồng Quản lý Hồ sơ) ✅

* ✅ `[FE/User]` Trang `Manage Profile` đã có sẵn tại `src/app/(admin)/(others-pages)/profile/page.tsx` (sử dụng template TailAdmin).
* ✅ `[FE/User]` Tích hợp API `GET /users/me` để hiển thị thông tin user trong `UserMetaCard` và `UserInfoCard` (có fallback mock data nếu API fails).
* ✅ `[FE/User]` Tạo component `ChangePasswordCard` với form "Đổi mật khẩu" và tích hợp API `PUT /users/me/password` trong trang Profile.

#### Epic 10: [DevOps] 🚀 (Deploy Thủ công)

* `[DevOps/BE]` Cài đặt Nginx trên EC2 làm reverse proxy cho `axum` (vd: 80 -> 3000).
* `[DevOps/BE]` Cài đặt `systemd` trên EC2 để quản lý service `axum`.
* `[DevOps/BE-Manual]` Viết script `deploy_backend.sh` (tự động `cargo build --release`, `scp`, `ssh` và `systemctl restart`).
* `[DevOps/FE-Manual]` Viết script `deploy_frontend.sh` (tự động `npm run build`, `aws s3 sync`).
* `[DevOps/Risk]` (Thử nghiệm) Thử thiết lập CI/CD. Nếu thất bại (do quyền 'Federated User'), xác nhận dùng phương án `Manual` ở trên.