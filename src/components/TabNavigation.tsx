import * as Tabs from "@radix-ui/react-tabs";
import type { ReactNode } from "react";
import { PageTransition } from "./PageTransition";

export interface TabItem {
  id: string;
  label: string;
  icon: ReactNode;
  content: ReactNode;
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabNavigation({
  tabs,
  activeTab,
  onTabChange,
}: TabNavigationProps) {
  return (
    <Tabs.Root
      value={activeTab}
      onValueChange={onTabChange}
      className="flex flex-col h-full"
    >
      {/* Tab List */}
      <Tabs.List className="flex items-center justify-center gap-1 px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 backdrop-blur-sm overflow-x-auto scrollbar-none transition-colors duration-300">
        {tabs.map((tab) => (
          <Tabs.Trigger
            key={tab.id}
            value={tab.id}
            className="tab-trigger flex items-center gap-2 whitespace-nowrap"
          >
            <span className="opacity-70">{tab.icon}</span>
            <span className="hidden tablet:inline">{tab.label}</span>
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <Tabs.Content
            key={tab.id}
            value={tab.id}
            className="h-full outline-none data-[state=inactive]:hidden"
            forceMount
          >
            <PageTransition transitionKey={activeTab === tab.id ? tab.id : ""}>
              {activeTab === tab.id ? tab.content : null}
            </PageTransition>
          </Tabs.Content>
        ))}
      </div>
    </Tabs.Root>
  );
}
