import { Home, Music, Plus, List } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface Playlist {
  id: string;
  name: string;
  tracks: any[];
}

interface MusicSidebarProps {
  playlists: Playlist[];
  onCreatePlaylist: () => void;
}

export function MusicSidebar({ playlists, onCreatePlaylist }: MusicSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const navigationItems = [
    { title: "Home", url: "/", icon: Home },
    { title: "My Library", url: "/library", icon: Music },
  ];

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className={`${collapsed ? "w-16" : "w-64"} border-r border-border bg-sidebar`}>
      <SidebarContent className="p-4">
        {/* Main Navigation */}
        <SidebarGroup className="mb-8">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                          isActive 
                            ? "bg-accent text-accent-foreground" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Playlists Section */}
        <SidebarGroup>
          <div className="flex items-center justify-between mb-4">
            {!collapsed && (
              <SidebarGroupLabel className="text-sidebar-foreground/70 font-semibold text-sm uppercase tracking-wide">
                Playlists
              </SidebarGroupLabel>
            )}
            <Button
              onClick={onCreatePlaylist}
              size="sm"
              variant="ghost"
              className="w-8 h-8 p-0 hover:bg-sidebar-accent"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {playlists.map((playlist) => (
                <SidebarMenuItem key={playlist.id}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={`/playlist/${playlist.id}`}
                      className={({ isActive }) => 
                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                          isActive 
                            ? "bg-accent text-accent-foreground" 
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        }`
                      }
                    >
                      <List className="w-4 h-4 flex-shrink-0" />
                      {!collapsed && (
                        <div className="flex-1 min-w-0">
                          <span className="font-medium truncate block">{playlist.name}</span>
                          <span className="text-xs text-sidebar-foreground/50">
                            {playlist.tracks.length} songs
                          </span>
                        </div>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}