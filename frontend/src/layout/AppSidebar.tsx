"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { useAuthStore } from "../lib/store/authStore";
import {
  BoxIcon,
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  FileIcon,
  GridIcon,
  GroupIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons/index";
// Đã bỏ SidebarWidget import

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
  allowedRoles?: string[]; // Roles được phép truy cập (undefined = tất cả roles)
};

// Menu items được sắp xếp theo nhóm logic:
// 1. Dashboard (home) - Tất cả roles
// 2. Database Operations (Explorer, Query, Instances) - Tất cả roles
// 3. User & Profile (Profile, User Management) - Profile: Tất cả, User Management: TenantAdmin+
// 4. Admin (Admin Dashboard, Super Admin, Audit Logs) - TenantAdmin+, SuperAdmin chỉ cho Super Admin
const allNavItems: NavItem[] = [
  // 1. Dashboard - Tất cả roles
  {
    icon: <GridIcon />,
    name: "Dashboard",
    path: "/",
    allowedRoles: undefined, // Tất cả roles
  },
  // 2. Database Operations - Tất cả roles
  {
    icon: <BoxIcon />,
    name: "Database Explorer",
    path: "/explorer",
    allowedRoles: undefined, // Tất cả roles
  },
  {
    icon: <FileIcon />,
    name: "Query Editor",
    path: "/query",
    allowedRoles: undefined, // Tất cả roles (DML/DDL sẽ được check trong component)
  },
  {
    icon: <BoxCubeIcon />,
    name: "Instances",
    path: "/instances",
    allowedRoles: undefined, // Tất cả roles (create/edit/delete sẽ được check trong component)
  },
  // 3. User & Profile
  {
    icon: <UserCircleIcon />,
    name: "User Profile",
    path: "/profile",
    allowedRoles: undefined, // Tất cả roles
  },
  {
    icon: <GroupIcon />,
    name: "User Management",
    path: "/users",
    allowedRoles: ['TenantAdmin', 'admin', 'SuperAdmin'], // Chỉ TenantAdmin+
  },
  // 4. Admin
  {
    icon: <PieChartIcon />,
    name: "Admin Dashboard",
    path: "/admin-dashboard",
    allowedRoles: ['TenantAdmin', 'admin', 'SuperAdmin'], // Chỉ TenantAdmin+
  },
  {
    icon: <BoxCubeIcon />,
    name: "Super Admin",
    path: "/admin",
    allowedRoles: ['SuperAdmin', 'admin'], // Chỉ Super Admin
  },
  {
    icon: <FileIcon />,
    name: "Audit Logs",
    path: "/audit-logs",
    allowedRoles: ['TenantAdmin', 'admin', 'SuperAdmin'], // Chỉ TenantAdmin+
  },
];

// Template menu items - ẩn đi vì không cần thiết
const othersItems: NavItem[] = [
  // Ẩn Charts, UI Elements, Authentication của template
  // Chỉ giữ các menu items cần thiết cho dự án
];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const { user } = useAuthStore();
  const userRole = user?.role || "";

  // Filter menu items dựa trên role của user
  const navItems = allNavItems.filter((item) => {
    // Nếu không có allowedRoles, tất cả roles đều có thể truy cập
    if (!item.allowedRoles || item.allowedRoles.length === 0) {
      return true;
    }
    // Kiểm tra role của user có trong allowedRoles không
    return item.allowedRoles.includes(userRole);
  });

  const renderMenuItems = (
    navItems: NavItem[],
    menuType: "main" | "others"
  ) => (
    <ul className="flex flex-col gap-4">
      {navItems.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group  ${openSubmenu?.type === menuType && openSubmenu?.index === index
                ? "menu-item-active"
                : "menu-item-inactive"
                } cursor-pointer ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
                }`}
            >
              <span
                className={` ${openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-icon-active"
                  : "menu-item-icon-inactive"
                  }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`menu-item-text`}>{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className={`ml-auto w-5 h-5 transition-transform duration-200  ${openSubmenu?.type === menuType &&
                  openSubmenu?.index === index
                  ? "rotate-180 text-brand-500"
                  : ""
                  }`}>
                  <ChevronDownIcon />
                </span>
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                  }`}
              >
                <span
                  className={`${isActive(nav.path)
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                    }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className={`menu-item-text`}>{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      href={subItem.path}
                      className={`menu-dropdown-item ${isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                        }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${isActive(subItem.path)
                              ? "menu-dropdown-badge-active"
                              : "menu-dropdown-badge-inactive"
                              } menu-dropdown-badge `}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => path === pathname;
  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    // Check if the current path matches any submenu item
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    // If no submenu item matches, close the open submenu
    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [pathname, isActive]);

  useEffect(() => {
    // Set the height of the submenu items when the submenu is opened
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${isExpanded || isMobileOpen
          ? "w-[290px]"
          : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex  ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
          }`}
      >
        <Link href="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2">
              <Image
                src="/images/logo/logo-icon.svg"
                alt="CloudDB Manager"
                width={32}
                height={32}
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                CloudDB Manager
              </span>
            </div>
          ) : (
            <Image
              src="/images/logo/logo-icon.svg"
              alt="CloudDB Manager"
              width={32}
              height={32}
            />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "justify-start"
                  }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            {/* Chỉ hiển thị section "Others" nếu có menu items */}
            {othersItems.length > 0 && (
              <div className="">
                <h2
                  className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${!isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                    }`}
                >
                  {isExpanded || isHovered || isMobileOpen ? (
                    "Others"
                  ) : (
                    <HorizontaLDots />
                  )}
                </h2>
                {renderMenuItems(othersItems, "others")}
              </div>
            )}
          </div>
        </nav>
        {/* Đã bỏ SidebarWidget (box Tailwind CSS Dashboard) */}
      </div>
    </aside>
  );
};

export default AppSidebar;
