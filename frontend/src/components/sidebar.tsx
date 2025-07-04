"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import Board from "@/app/Board";
import { Column } from "@/app/Board";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-900 dark:bg-neutral-950 w-[300px] shrink-0",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-900 dark:bg-neutral-950 w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-white"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
            >
              <div
                className="absolute right-10 top-10 z-50 text-white"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2  group/sidebar py-2",
        className
      )}
      {...props}
    >
      <span className="w-5 h-5 text-blue-400">{link.icon}</span>
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-white text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </a>
  );
};

// Update documents state type
type Document = {
  name: string;
  config: undefined | Column[];
};

export const SidebarWrapper = ({
  className,
  animate = true,
}: {
  className?: string;
  animate?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [showDocumentsView, setShowDocumentsView] = useState(false);
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      name: "Document1",
      config: undefined, // undefined means use Board's default config
    },
  ]);
  const [selectedDocIdx, setSelectedDocIdx] = useState(0);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");

  // Example navigation links - you can customize these
  const navigationLinks: Links[] = [
    {
      label: "Dashboard",
      href: "/",
      icon: (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
    },
    {
      label: "Documents",
      href: "#",
      icon: (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      onClick: () => setShowDocumentsView(true),
    },
    {
      label: "Collaboration",
      href: "/collaboration",
      icon: (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
    },
    {
      label: "Settings",
      href: "/settings",
      icon: (
        <svg
          className="w-5 h-5 text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // Render sidebar content
  const renderSidebarContent = () => {
    if (showDocumentsView) {
      return (
        <div className="flex flex-col h-full">
          {/* Back button */}
          <button
            className="mb-4 text-white flex items-center gap-2 hover:underline"
            onClick={() => setShowDocumentsView(false)}
          >
            <span>&larr;</span> Back
          </button>
          {/* Documents list */}
          <div className="flex-1 overflow-y-auto">
            <div className="mb-2 text-white font-semibold">Documents</div>
            <ul className="space-y-2">
              {documents.map((doc, idx) => (
                <li key={idx}>
                  <button
                    className={`w-full text-left px-2 py-1 rounded ${selectedDocIdx === idx ? "bg-blue-700 text-white" : "bg-neutral-800 text-gray-200"}`}
                    onClick={() => setSelectedDocIdx(idx)}
                  >
                    {doc.name} {idx === selectedDocIdx && <span className="text-xs">(current)</span>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {/* Add new document */}
          <div className="mt-4">
            {showJsonInput ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full h-32 p-2 rounded bg-neutral-900 text-white border border-neutral-700"
                  placeholder="Paste your JSON config here..."
                  value={jsonInput}
                  onChange={e => setJsonInput(e.target.value)}
                />
                {jsonError && <div className="text-red-400 text-xs">{jsonError}</div>}
                <div className="flex gap-2">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(jsonInput);
                        if (!Array.isArray(parsed)) throw new Error("Config must be an array of columns");
                        setDocuments(prev => ([...prev, { name: `Document${prev.length + 1}`, config: parsed }]));
                        setSelectedDocIdx(documents.length); // select new doc
                        setJsonInput("");
                        setJsonError("");
                        setShowJsonInput(false);
                      } catch (e: unknown) {
                        setJsonError(e instanceof Error ? e.message : "Invalid JSON");
                      }
                    }}
                  >
                    Submit
                  </button>
                  <button
                    className="bg-neutral-700 text-white px-3 py-1 rounded"
                    onClick={() => {
                      setShowJsonInput(false);
                      setJsonInput("");
                      setJsonError("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="w-full bg-blue-600 text-white px-3 py-2 rounded mt-2"
                onClick={() => setShowJsonInput(true)}
              >
                + Add Document
              </button>
            )}
          </div>
        </div>
      );
    }
    // Default sidebar content
    return (
      <div className="flex flex-col h-full">
        {/* Logo/Brand Section */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">C8</span>
          </div>
          <motion.span
            animate={{
              display: animate ? (open ? "inline-block" : "none") : "inline-block",
              opacity: animate ? (open ? 1 : 0) : 1,
            }}
            className="text-lg font-semibold text-white"
          >
            Kanban-UI
          </motion.span>
        </div>
        {/* Navigation Links */}
        <nav className="flex-1 space-y-2">
          {navigationLinks.map((link, index) => (
            link.label === "Documents" ? (
              <button
                key={index}
                className={cn(
                  "flex items-center justify-start gap-2 group/sidebar py-2 hover:bg-neutral-800 dark:hover:bg-neutral-900 rounded-lg px-2 transition-colors text-white w-full"
                )}
                onClick={link.onClick}
              >
                <span className="w-5 h-5 text-blue-400">{link.icon}</span>
                <motion.span
                  animate={{
                    display: animate ? (open ? "inline-block" : "none") : "inline-block",
                    opacity: animate ? (open ? 1 : 0) : 1,
                  }}
                  className="text-white text-sm group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
                >
                  {link.label}
                </motion.span>
              </button>
            ) : (
              <SidebarLink
                key={index}
                link={link}
                className={cn(
                  "hover:bg-neutral-800 dark:hover:bg-neutral-900 rounded-lg px-2 transition-colors text-white"
                )}
              />
            )
          ))}
        </nav>
        {/* User Profile Section */}
        <div className="mt-auto pt-4 border-t border-neutral-700 dark:border-neutral-900">
          <div className="flex items-center gap-2 py-2">
            <div className="w-8 h-8 bg-neutral-800 dark:bg-neutral-900 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                U
              </span>
            </div>
            <motion.div
              animate={{
                display: animate ? (open ? "block" : "none") : "block",
                opacity: animate ? (open ? 1 : 0) : 1,
              }}
              className="flex-1"
            >
              <p className="text-sm font-medium text-white">
                User Name
              </p>
              <p className="text-xs text-gray-300">
                user@example.com
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  };

  // Main content area: render Board with selected document config
  const renderMainContent = () => {
    const doc = documents[selectedDocIdx];
    return <Board columns={doc.config} />;
  };

  return (
    <div className={cn("flex h-screen", className)}>
      <Sidebar open={open} setOpen={setOpen} animate={animate}>
        <SidebarBody>
          {renderSidebarContent()}
        </SidebarBody>
      </Sidebar>
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {renderMainContent()}
      </div>
    </div>
  );
};
