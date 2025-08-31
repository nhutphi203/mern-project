import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getNavigationItems, NavigationItem } from '@/utils/navigation';
import { useCurrentUser } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { labService } from '@/api/lab.service';
import { billingService } from '@/api/billing.service';

interface SidebarProps {
    className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const { data: currentUser } = useCurrentUser();
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState<string[]>(['laboratory', 'billing']);

    const userRole = currentUser?.user?.role || 'Patient';
    const navigationItems = getNavigationItems(userRole);

    // Get badges for dynamic counts
    const canViewLabQueue = ['Lab Technician', 'Admin'].includes(userRole);
    const canViewInvoices = ['Admin', 'Insurance Staff', 'Receptionist'].includes(userRole);

    // Sử dụng React Query trực tiếp để tránh vòng lặp cập nhật
    const { data: labQueueData } = useQuery({
        queryKey: ['labQueue', 'count'],
        queryFn: async () => {
            if (!canViewLabQueue) return { count: 0 };
            try {
                const response = await labService.getLabQueue({ status: 'Pending' });
                return { count: response.orders?.length || 0 };
            } catch (error) {
                console.error("Error fetching lab queue count:", error);
                return { count: 0 };
            }
        },
        enabled: canViewLabQueue,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Tương tự với invoices
    const { data: invoicesData } = useQuery({
        queryKey: ['invoices', 'count'],
        queryFn: async () => {
            if (!canViewInvoices) return { count: 0 };
            try {
                const response = await billingService.getAllInvoices();
                return { count: response.count || 0 };
            } catch (error) {
                console.error("Error fetching invoices count:", error);
                return { count: 0 };
            }
        },
        enabled: canViewInvoices,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const toggleExpanded = (key: string) => {
        setExpandedItems(prev =>
            prev.includes(key)
                ? prev.filter(item => item !== key)
                : [...prev, key]
        );
    };

    const getBadgeCount = (key: string): number | undefined => {
        try {
            switch (key) {
                case 'lab-queue':
                    return canViewLabQueue ? (labQueueData?.count || 0) : undefined;
                case 'invoices':
                    return canViewInvoices ? (invoicesData?.count || 0) : undefined;
                default:
                    return undefined;
            }
        } catch (error) {
            console.warn(`Badge count error for ${key}:`, error);
            return undefined;
        }
    };

    const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
        const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.key);
        const badgeCount = getBadgeCount(item.key);

        if (hasChildren) {
            return (
                <Collapsible key={item.key} open={isExpanded} onOpenChange={() => toggleExpanded(item.key)}>
                    <CollapsibleTrigger asChild>
                        <Button
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 h-10 transition-all duration-300",
                                level > 0 && "pl-8",
                                isActive && "bg-primary/10 text-primary"
                            )}
                        >
                            <span className="min-w-[1.5rem] flex justify-center">
                                {item.icon}
                            </span>
                            <span className="flex-1 text-left whitespace-nowrap">
                                {item.label}
                            </span>
                            {badgeCount && badgeCount > 0 && (
                                <Badge variant="secondary" className="ml-auto mr-2 text-xs">
                                    {badgeCount}
                                </Badge>
                            )}
                            <span>
                                {isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </span>
                        </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-1">
                        {item.children?.map(child => renderNavigationItem(child, level + 1))}
                    </CollapsibleContent>
                </Collapsible>
            );
        }

        const itemPath = typeof item.path === 'function' ? item.path(userRole) : item.path;

        return (
            <Button
                key={item.key}
                variant="ghost"
                asChild
                className={cn(
                    "w-full justify-start gap-3 h-10 transition-all duration-300",
                    level > 0 && "pl-8",
                    isActive && "bg-primary/10 text-primary"
                )}
            >
                <Link to={itemPath}>
                    <span className="min-w-[1.5rem] flex justify-center">
                        {item.icon}
                    </span>
                    <span className="flex-1 text-left whitespace-nowrap">
                        {item.label}
                    </span>
                    {badgeCount && badgeCount > 0 && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                            {badgeCount}
                        </Badge>
                    )}
                </Link>
            </Button>
        );
    };

    return (
        <div className="sidebar-container">
            {/* CSS cho sidebar behavior */}
            <style>{`
                .sidebar-container:hover .sidebar {
                    transform: translateX(0);
                    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
                }
                
                .sidebar-trigger {
                    transition: background 0.2s ease;
                }
                
                .sidebar-trigger:hover {
                    background: linear-gradient(to right, rgba(59, 130, 246, 0.08), transparent);
                }
                
                /* Responsive */
                @media (max-width: 768px) {
                    .sidebar-container:hover .sidebar-overlay {
                        opacity: 1;
                        pointer-events: auto;
                    }
                }
            `}</style>

            {/* Trigger zone - vùng kích hoạt hover ở cạnh trái màn hình */}
            <div className="sidebar-trigger fixed left-0 top-0 w-4 h-full z-[60] bg-transparent cursor-pointer" />

            {/* Sidebar chính - ẩn hoàn toàn mặc định */}
            <aside className={cn(
                "sidebar fixed left-0 top-0 h-full w-64 bg-background border-r z-50 transition-all duration-300 ease-in-out shadow-lg",
                "transform -translate-x-full", // Ẩn hoàn toàn
                className
            )}>
                {/* Logo section */}
                <div className="p-4 border-b bg-background">
                    <Link to="/dashboard" className="flex items-center gap-3">
                        <div className="h-8 w-8  rounded-lg flex  justify-center flex-shrink-0">
                        </div>

                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4 overflow-y-auto bg-background">
                    {navigationItems.map(item => renderNavigationItem(item))}
                </nav>

                {/* Role indicator */}
                <div className="p-4 border-t bg-background">
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        Logged in as <span className="font-medium">{userRole}</span>
                    </div>
                </div>
            </aside>

            {/* Overlay backdrop cho mobile */}
            <div className="sidebar-overlay fixed inset-0 bg-black/20 z-30 opacity-0 pointer-events-none transition-opacity duration-300 md:hidden" />
        </div>
    );
};

export default Sidebar;