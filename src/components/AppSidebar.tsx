import { Factory, FlaskConical, Wrench, ShoppingCart, LayoutDashboard, MessageCircle, Clock } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const items = [
  { title: "Field Service Dashboard", url: "/dashboard/fieldservice", icon: LayoutDashboard },
  { title: "Manufacturing Dashboard", url: "/dashboard/manufacturing", icon: Factory },
  { title: "Testing Dashboard", url: "/dashboard/testing", icon: FlaskConical },
  { title: "Sales Dashboard", url: "/dashboard/sales", icon: ShoppingCart },
  { title: "Recent Records", url: "/recent", icon: Clock },
  { title: "Field Service Form", url: "/field", icon: Wrench },
  { title: "Manufacturing Form", url: "/manufacturing", icon: Factory },
  { title: "Testing Form", url: "/testing", icon: FlaskConical },
  { title: "Sales Form", url: "/sales", icon: ShoppingCart },
];

export function AppSidebar() {
  const { open } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={open ? "w-64" : "w-16"} collapsible="icon">
      <SidebarContent>
        <div className="flex flex-col h-full">
          <div>
            <div className="p-4 border-b border-sidebar-border">
              {open && (
                <h2 className="text-lg font-semibold text-sidebar-foreground">
                  Dashboard
                </h2>
              )}
            </div>
            <SidebarGroup>
              <SidebarGroupLabel>Departments</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end
                          className="hover:bg-sidebar-accent"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4" />
                          {open && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </div>

          {/* Bottom AI chat icon */}
          <div className="mt-auto p-3 border-sidebar-border flex justify-start">
            <NavLink
              to="/chat"
              end
              className={`flex items-center justify-center rounded-full p-3 hover:bg-sidebar-accent ${
                isActive("/chat") ? "bg-sidebar-accent text-sidebar-primary" : ""
              }`}
            >
              <MessageCircle className="h-10 w-10" />
            </NavLink>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
