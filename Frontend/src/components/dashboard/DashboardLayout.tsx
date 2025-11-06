import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { 
  Sparkles, 
  MessageSquare, 
  History, 
  Settings, 
  FileText, 
  Puzzle,
  LogOut,
  User,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="text-white h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Text Processing",
      href: "/text-processing",
      icon: <FileText className="text-white h-5 w-5 flex-shrink-0" />
    },
    {
      label: "History",
      href: "/preferences",
      icon: <History className="text-white h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Plugin",
      href: "/plugin",
      icon: <Puzzle className="text-white h-5 w-5 flex-shrink-0" />
    },
    {
      label: "Settings",
      href: "/preferences",
      icon: <Settings className="text-white h-5 w-5 flex-shrink-0" />
    }
  ];

  const handleLogout = () => {
    navigate("/auth");
  };

  return (
    <div className="flex w-full h-screen overflow-hidden bg-black">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "John Doe",
                href: "#",
                icon: (
                  <div className="h-7 w-7 flex-shrink-0 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                ),
              }}
            />
            <button
              onClick={handleLogout}
              className="flex items-center justify-start gap-2 group/sidebar py-2 px-2 rounded-lg hover:bg-gray-900 transition-colors w-full mt-2"
            >
              <LogOut className="text-white h-5 w-5 flex-shrink-0" />
              <motion.span
                animate={{
                  display: open ? "inline-block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="text-gray-300 text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
              >
                Logout
              </motion.span>
            </button>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

const Logo = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-bold text-white whitespace-pre"
      >
        StyleTalk AI
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      to="/"
      className="font-normal flex space-x-2 items-center text-sm py-1 relative z-20"
    >
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-5 h-5 text-white" />
      </div>
    </Link>
  );
};

export default DashboardLayout;
