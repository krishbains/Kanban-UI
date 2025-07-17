"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX, IconTrash } from "@tabler/icons-react";
import Board from "@/app/Board";
import { Column } from "@/app/Board";
import { SaveButton } from "./SaveButton";
import { saveWorkspace, loadWorkspace, deleteWorkspace } from "@/lib/workspace";
import { defaultSchema } from "@/lib/defaultSchema";
import AIInput from "./AIInput";
import ShelfSpace from "./ShelfSpace";

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

// Add prop types for showDocumentsView
interface SidebarBodyProps extends React.ComponentProps<typeof motion.div> {
  showDocumentsView?: boolean;
}

export const SidebarBody = (props: SidebarBodyProps) => {
  // Destructure showDocumentsView so it is not passed to MobileSidebar
  const { showDocumentsView, children, className, ...restProps } = props;
  return (
    <>
      <DesktopSidebar {...restProps} className={className} showDocumentsView={showDocumentsView}>
        {children}
      </DesktopSidebar>
      <MobileSidebar className={className}>{children as React.ReactNode}</MobileSidebar>
    </>
  );
};

interface DesktopSidebarProps extends React.ComponentProps<typeof motion.div> {
  showDocumentsView?: boolean;
}

export const DesktopSidebar = ({
  className,
  children,
  showDocumentsView,
  ...props
}: DesktopSidebarProps) => {
  const { open, setOpen, animate } = useSidebar();
  const isUncollapsible = !!showDocumentsView;
  return (
    <>
      <motion.div
        className={cn(
          "h-full px-4 py-4 hidden  md:flex md:flex-col bg-neutral-900 dark:bg-neutral-950 w-[300px] shrink-0",
          className
        )}
        animate={{
          width: animate && !isUncollapsible ? (open ? "300px" : "60px") : "300px",
        }}
        onMouseEnter={isUncollapsible ? undefined : () => setOpen(true)}
        onMouseLeave={isUncollapsible ? undefined : () => setOpen(false)}
        {...props} // showDocumentsView is not included here
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
      {/* Hamburger/close button always visible at top left on mobile */}
      <button
        className="fixed top-4 left-4 z-[200] bg-neutral-900 text-white rounded-full p-2 shadow-lg md:hidden"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close sidebar" : "Open sidebar"}
      >
        {open ? <IconX className="w-6 h-6" /> : <IconMenu2 className="w-6 h-6" />}
      </button>
      {/* Only render the bar when sidebar is open on mobile */}
      {open && (
        <div
          className={cn(
            "h-10 px-4 py-4 flex flex-row md:hidden  items-center justify-between bg-neutral-900 dark:bg-neutral-950 w-full"
          )}
          {...props}
        >
          {/* Hide the hamburger here, since it's now fixed at top left */}
          <div className="flex justify-end z-20 w-full" style={{ visibility: 'hidden' }}>
            <IconMenu2 className="text-white" />
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
                  "fixed h-full w-full inset-0 bg-neutral-900 dark:bg-neutral-950 p-10 z-[100] flex flex-col justify-between",
                  className
                )}
              >
                {/* Remove the close button here, since it's now fixed at top left */}
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
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
  const [showShelfSpaceView, setShowShelfSpaceView] = useState(false);
  const [showJsonInput, setShowJsonInput] = useState(false);
  const [showAiInput, setShowAiInput] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([
    {
      name: "Document1",
      config: undefined, // undefined means use Board's default config
    },
  ]);
  const [selectedDocIdx, setSelectedDocIdx] = useState(0);
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedDocs, setSelectedDocs] = useState<number[]>([]);
  const [renamingIdx, setRenamingIdx] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState("");
  // Detect mobile (iPhone 14 width)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 430);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load documents list on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      try {
        // Try to load from localStorage first (for documents list)
        const savedDocuments = localStorage.getItem('kanban_documents_list');
        if (savedDocuments) {
          const parsed = JSON.parse(savedDocuments);
          if (Array.isArray(parsed)) {
            setDocuments(parsed);
          }
        }
      } catch (error) {
        console.error("Error loading documents list:", error);
      }
    };
    loadDocuments();
  }, []);

  // Save documents list whenever it changes
  useEffect(() => {
    const docNames = documents.map(d => d.name);
    const saveDocuments = async () => {
      try {
        // Only save the documents list (names, not configs) to localStorage
        const docList = docNames.map(name => ({ name }));
        localStorage.setItem('kanban_documents_list', JSON.stringify(docList));
      } catch (error) {
        console.error("Error saving documents list:", error);
      }
    };
    saveDocuments();
  }, [documents.map(d => d.name).join(",")]);

  // Save individual document when its config changes
  const saveDocument = async (docName: string, config: Column[]) => {
    try {
      await saveWorkspace(config, docName);
    } catch (error) {
      console.error(`Error saving document ${docName}:`, error);
    }
  };

  // Load individual document when switching
  const loadDocument = async (docName: string) => {
    try {
      const loadedConfig = await loadWorkspace(docName);
      return loadedConfig || defaultSchema;
    } catch (error) {
      console.error(`Error loading document ${docName}:`, error);
      return defaultSchema;
    }
  };

  // Handler to update the current document's config in state
  const handleSchemaChange = (newSchema: Column[]) => {
    const currentDoc = documents[selectedDocIdx];
    if (currentDoc) {
      // Update local state only, do not save to Firebase
      setDocuments(prev => prev.map((d, i) => i === selectedDocIdx ? { ...d, config: newSchema } : d));
    }
  };

  // Handler to switch documents
  const handleDocumentSwitch = async (idx: number) => {
    const doc = documents[idx];
    if (doc && !doc.config) {
      // Load the document's config from Firebase
      const loadedConfig = await loadDocument(doc.name);
      setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, config: loadedConfig } : d));
    }
    setSelectedDocIdx(idx);
  };

  // Handler for renaming a document
  const handleRename = async (idx: number) => {
    const oldName = documents[idx].name;
    const newName = renameValue.trim();
    if (!newName || newName === oldName) {
      setRenamingIdx(null);
      setRenameValue("");
      return;
    }
    // Save config under new name, delete old
    const config = documents[idx].config || [];
    await saveWorkspace(config, newName);
    await deleteWorkspace(oldName);
    setDocuments(prev => prev.map((d, i) => i === idx ? { ...d, name: newName } : d));
    setRenamingIdx(null);
    setRenameValue("");
    // If current doc is renamed, update selectedDocIdx
    if (selectedDocIdx === idx) {
      setSelectedDocIdx(idx);
    }
  };
  // Handler for multi-select delete
  const handleDeleteSelected = async () => {
    const toDelete = selectedDocs;
    for (const idx of toDelete) {
      await deleteWorkspace(documents[idx].name);
    }
    setDocuments(prev => prev.filter((_, i) => !toDelete.includes(i)));
    setSelectedDocs([]);
    // If current doc is deleted, select first remaining
    if (toDelete.includes(selectedDocIdx)) {
      setSelectedDocIdx(0);
    }
  };

  // Handler for trash can click
  const handleTrashClick = async () => {
    if (!multiSelect) {
      setMultiSelect(true);
      setSelectedDocs([]);
      return;
    }
    if (selectedDocs.length > 0) {
      await handleDeleteSelected();
      setMultiSelect(false);
    } else {
      setMultiSelect(false);
    }
  };

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
      label: "Shelf Space",
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      onClick: () => setShowShelfSpaceView(true),
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
          {/* Back button and actions */}
          <div className="flex items-center gap-2 mb-4">
            <button
              className="text-white flex items-center gap-2 hover:underline"
              onClick={() => setShowDocumentsView(false)}
            >
              <span>&larr;</span> Back
            </button>
            <button
              className={`ml-auto px-3 py-1 rounded text-2xl ${multiSelect ? "bg-red-700 text-white" : "bg-neutral-700 text-gray-200"}`}
              title="Delete Documents"
              onClick={handleTrashClick}
            >
              <IconTrash size={18} />
            </button>
          </div>
          {/* Documents list */}
          <div className="flex-1 overflow-y-auto">
            <div className="mb-2 text-white font-semibold">Documents</div>
            <ul className="space-y-2">
              {documents.map((doc, idx) => (
                <li key={idx} className="flex items-center gap-2 group">
                  {multiSelect && (
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(idx)}
                      onChange={e => {
                        setSelectedDocs(sel =>
                          e.target.checked
                            ? [...sel, idx]
                            : sel.filter(i => i !== idx)
                        );
                      }}
                      className="accent-blue-600"
                    />
                  )}
                  {renamingIdx === idx ? (
                    <form
                      className="flex-1 flex gap-2"
                      onSubmit={e => {
                        e.preventDefault();
                        handleRename(idx);
                      }}
                    >
                      <input
                        className="flex-1 px-2 py-1 rounded bg-neutral-800 text-white border border-blue-500 focus:outline-none"
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        autoFocus
                        onBlur={() => handleRename(idx)}
                      />
                      <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded">Save</button>
                    </form>
                  ) : (
                    <button
                      className={`flex-1 text-left px-2 py-1 rounded transition-colors ${selectedDocIdx === idx ? "bg-blue-700 text-white" : "bg-neutral-800 text-gray-200"} group-hover:bg-blue-800`}
                      onClick={() => handleDocumentSwitch(idx)}
                    >
                      {doc.name} {idx === selectedDocIdx && <span className="text-xs">(current)</span>}
                    </button>
                  )}
                  {!multiSelect && renamingIdx !== idx && (
                    <button
                      className="ml-1 text-blue-400 hover:text-blue-200 opacity-70 hover:opacity-100 transition"
                      title="Rename"
                      onClick={() => {
                        setRenamingIdx(idx);
                        setRenameValue(documents[idx].name);
                      }}
                    >
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16.475 5.408a2.317 2.317 0 1 1 3.277 3.277L8.5 19.937l-4.243.707.707-4.243 11.511-11.511Z"/></svg>
                    </button>
                  )}
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
                        const newDocName = `Document${documents.length + 1}`;
                        const newDoc = { name: newDocName, config: parsed };
                        setDocuments(prev => [...prev, newDoc]);
                        setSelectedDocIdx(documents.length);
                        // Save the new document to Firebase
                        saveDocument(newDocName, parsed);
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
                {/* AI Template Button */}
                <button
                  className="w-full bg-purple-600 text-white px-3 py-2 rounded mt-2"
                  onClick={() => setShowAiInput(true)}
                >
                  + AI Template
                </button>
                {showAiInput && (
                  <AIInput
                    onJsonResult={(json: Record<string, unknown>) => {
                      console.log('AI JSON:', json);
                      setJsonInput(JSON.stringify(json, null, 2));
                      setShowAiInput(false);
                    }}
                    onCancel={() => setShowAiInput(false)}
                  />
                )}
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
    if (showShelfSpaceView) {
      return (
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 mb-4">
            <button
              className="text-white flex items-center gap-2 hover:underline"
              onClick={() => setShowShelfSpaceView(false)}
            >
              <span>&larr;</span> Back
            </button>
          </div>
          <ShelfSpace />
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
            link.label === "Documents" || link.label === "Shelf Space" ? (
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
    return (
      <div className={`h-full flex flex-col`}> {/* Board main content */}
        <div className="p-4 flex items-center gap-4">
          <span className="font-semibold text-white text-md md:text-lg">{doc.name}</span>
          <SaveButton schema={doc.config || []} workspaceName={doc.name} />
        </div>
        <div className="flex-1">
          <Board columns={doc.config} onSchemaChange={handleSchemaChange} isMobile={isMobile} />
        </div>
      </div>
    );
  };

  return (
    <div className={cn("flex h-screen", className)}>
      {/* Sidebar: hide on mobile if board is visible */}
      <div className={`h-full`}>
        <Sidebar open={open} setOpen={setOpen} animate={animate}>
          <SidebarBody showDocumentsView={showDocumentsView}>
            {renderSidebarContent()}
          </SidebarBody>
        </Sidebar>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderMainContent()}
      </div>
    </div>
  );
};
