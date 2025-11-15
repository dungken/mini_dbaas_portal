# Phân quyền và Role - Role-Based Access Control (RBAC)

File này mô tả chi tiết về phân quyền và role trong hệ thống CloudDB Manager.

---

## 📋 Danh sách Roles

Hệ thống có 4 roles chính:

1. **SuperAdmin** - Quản trị viên hệ thống
2. **TenantAdmin** - Quản trị viên tenant
3. **Developer** - Nhà phát triển
4. **viewer** - Người xem (chỉ đọc)

**Lưu ý:** Role `admin` là alias của `TenantAdmin` (để backward compatibility).

---

## 🔐 Chi tiết Phân quyền

### 1. 👑 SuperAdmin

**Email:** `superadmin@example.com`  
**Password:** `superadmin123`

**Quyền hạn:**
- ✅ Tất cả quyền của TenantAdmin, Developer, và Viewer
- ✅ Xem tất cả tenants trong hệ thống
- ✅ Tạo/Sửa/Xóa tenants
- ✅ Quản lý quotas cho mọi tenant
- ✅ Cấu hình system settings (password_min_length, etc.)
- ✅ Xem audit logs toàn hệ thống
- ✅ Xem metrics toàn hệ thống
- ✅ Quản lý users trong mọi tenant

**Menu Items hiển thị:**
- Dashboard
- Database Explorer
- Query Editor (có thể chạy SELECT/DML/DDL)
- Instances (có thể create/edit/delete)
- User Profile
- User Management
- Admin Dashboard
- **Super Admin** (chỉ role này mới thấy)
- Audit Logs

---

### 2. 🏢 TenantAdmin

**Email:** `tenantadmin@example.com`  
**Password:** `tenantadmin123`

**Quyền hạn:**
- ✅ Tất cả quyền của Developer và Viewer
- ✅ Quản lý users trong tenant của mình
- ✅ Mời user mới vào tenant
- ✅ Quản lý roles của users trong tenant
- ✅ Deactivate users trong tenant
- ✅ Xem metrics và charts của tenant
- ✅ Xem audit logs của tenant

**Menu Items hiển thị:**
- Dashboard
- Database Explorer
- Query Editor (có thể chạy SELECT/DML/DDL)
- Instances (có thể create/edit/delete)
- User Profile
- **User Management** (chỉ TenantAdmin+)
- **Admin Dashboard** (chỉ TenantAdmin+)
- **Audit Logs** (chỉ TenantAdmin+)
- ❌ Super Admin (không thấy)

---

### 3. 👨‍💻 Developer

**Email:** `developer@example.com`  
**Password:** `developer123`

**Quyền hạn:**
- ✅ Tất cả quyền của Viewer
- ✅ Tạo/Sửa/Xóa database instances
- ✅ Chạy SELECT queries (đọc)
- ✅ Chạy DML queries (INSERT, UPDATE, DELETE)
- ✅ Chạy DDL queries (CREATE, ALTER, DROP, TRUNCATE)
- ✅ Start/Stop instances
- ✅ Delete instances

**Menu Items hiển thị:**
- Dashboard
- Database Explorer
- Query Editor (có thể chạy SELECT/DML/DDL)
- Instances (có thể create/edit/delete)
- User Profile
- ❌ User Management (không thấy)
- ❌ Admin Dashboard (không thấy)
- ❌ Super Admin (không thấy)
- ❌ Audit Logs (không thấy)

---

### 4. 👁️ Viewer

**Email:** `viewer@example.com`  
**Password:** `viewer123`

**Quyền hạn:**
- ✅ Xem database schema
- ✅ Chạy SELECT queries (chỉ đọc)
- ✅ Xem instances (không thể tạo/sửa/xóa)
- ✅ Xem profile của mình
- ❌ Không thể chạy DML/DDL queries
- ❌ Không thể tạo/sửa/xóa instances
- ❌ Không thể quản lý users

**Menu Items hiển thị:**
- Dashboard
- Database Explorer
- Query Editor (chỉ SELECT, không thể chạy DML/DDL)
- Instances (chỉ xem, không thể create/edit/delete)
- User Profile
- ❌ User Management (không thấy)
- ❌ Admin Dashboard (không thấy)
- ❌ Super Admin (không thấy)
- ❌ Audit Logs (không thấy)

---

## 🛡️ Bảo vệ Routes và Components

### Menu Items Filtering (AppSidebar)

Menu items được filter động dựa trên role của user:

```typescript
// Menu items với allowedRoles
{
  name: "User Management",
  path: "/users",
  allowedRoles: ['TenantAdmin', 'admin', 'SuperAdmin'], // Chỉ TenantAdmin+
},
{
  name: "Super Admin",
  path: "/admin",
  allowedRoles: ['SuperAdmin', 'admin'], // Chỉ Super Admin
},
{
  name: "Dashboard",
  path: "/",
  allowedRoles: undefined, // Tất cả roles
}
```

### Page-Level Protection (WithRole)

Tất cả các trang được bảo vệ bằng `WithRole` component:

```typescript
<WithRole roles={['TenantAdmin', 'admin', 'SuperAdmin']} fallback={
  <div>You don't have permission to access this page.</div>
}>
  {/* Page content */}
</WithRole>
```

### Component-Level Protection

Một số buttons/actions được bảo vệ bằng `WithRole`:

```typescript
<WithRole roles={['Developer', 'TenantAdmin', 'admin', 'SuperAdmin']}>
  <Button onClick={handleDelete}>Delete Instance</Button>
</WithRole>
```

### Query Execution Protection

Trong Query Editor, DML/DDL queries được check role trước khi execute:

```typescript
if (detectedType === 'DML' || detectedType === 'DDL') {
  const allowedRoles = ['Developer', 'TenantAdmin', 'admin', 'SuperAdmin'];
  if (!allowedRoles.includes(userRole)) {
    setError(`Only Developer, TenantAdmin, Admin, or SuperAdmin roles can execute ${detectedType} queries`);
    return;
  }
}
```

---

## 📍 Mapping Routes và Roles

| Route | SuperAdmin | TenantAdmin | Developer | Viewer |
|-------|:----------:|:-----------:|:---------:|:------:|
| `/` (Dashboard) | ✅ | ✅ | ✅ | ✅ |
| `/explorer` | ✅ | ✅ | ✅ | ✅ |
| `/query` | ✅ (All) | ✅ (All) | ✅ (All) | ✅ (SELECT only) |
| `/instances` | ✅ (All) | ✅ (All) | ✅ (All) | ✅ (View only) |
| `/profile` | ✅ | ✅ | ✅ | ✅ |
| `/users` | ✅ | ✅ | ❌ | ❌ |
| `/admin-dashboard` | ✅ | ✅ | ❌ | ❌ |
| `/admin` (Super Admin) | ✅ | ❌ | ❌ | ❌ |
| `/audit-logs` | ✅ | ✅ | ❌ | ❌ |

**Legend:**
- ✅ = Có quyền truy cập
- ❌ = Không có quyền truy cập
- (All) = Tất cả chức năng
- (SELECT only) = Chỉ SELECT queries
- (View only) = Chỉ xem, không tạo/sửa/xóa

---

## 🔒 Security Notes

1. **Frontend Protection là UI-only**: Bảo vệ ở frontend chỉ để cải thiện UX (ẩn menu, disable buttons). Backend API phải luôn validate role ở server-side.

2. **Role được lưu trong JWT**: Role được lưu trong JWT token và được decode ở frontend. Backend phải validate token và role cho mỗi request.

3. **Role aliases**: Role `admin` được coi là alias của `TenantAdmin` để backward compatibility.

4. **ProtectedRoute**: Tất cả routes trong `(admin)` layout được bảo vệ bởi `ProtectedRoute`, yêu cầu user phải đăng nhập.

---

## 🧪 Test Scenarios

### Test SuperAdmin
1. Login với `superadmin@example.com` / `superadmin123`
2. Kiểm tra menu: Tất cả menu items đều hiển thị
3. Kiểm tra Super Admin page: Có thể truy cập
4. Kiểm tra Query Editor: Có thể chạy DML/DDL

### Test TenantAdmin
1. Login với `tenantadmin@example.com` / `tenantadmin123`
2. Kiểm tra menu: Không thấy "Super Admin"
3. Kiểm tra User Management: Có thể truy cập
4. Kiểm tra Super Admin page: Redirect hoặc hiển thị "No permission"

### Test Developer
1. Login với `developer@example.com` / `developer123`
2. Kiểm tra menu: Không thấy "User Management", "Admin Dashboard", "Super Admin", "Audit Logs"
3. Kiểm tra Query Editor: Có thể chạy DML/DDL
4. Kiểm tra Instances: Có thể create/edit/delete

### Test Viewer
1. Login với `viewer@example.com` / `viewer123`
2. Kiểm tra menu: Chỉ thấy Dashboard, Explorer, Query Editor, Instances, Profile
3. Kiểm tra Query Editor: Không thể chạy DML/DDL (error message)
4. Kiểm tra Instances: Không thấy buttons create/edit/delete

---

## 📝 Implementation Details

### AppSidebar Filtering
```typescript
// Filter menu items dựa trên role của user
const navItems = allNavItems.filter((item) => {
  if (!item.allowedRoles || item.allowedRoles.length === 0) {
    return true; // Tất cả roles
  }
  return item.allowedRoles.includes(userRole);
});
```

### WithRole Component
```typescript
export default function WithRole({ roles, children, fallback = null }: WithRoleProps) {
  const { user } = useAuthStore();
  const userRole = user?.role || "";

  if (!userRole || !roles.includes(userRole)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

---

## 🚀 Future Improvements

1. **Role Hierarchy**: Implement role hierarchy để SuperAdmin tự động có tất cả permissions
2. **Permission Granularity**: Thay vì chỉ có role, implement granular permissions (ví dụ: `users.invite`, `instances.delete`)
3. **Dynamic Menu**: Load menu items từ backend API dựa trên permissions của user
4. **Role-based API Routes**: Backend API phải validate role cho mỗi endpoint

