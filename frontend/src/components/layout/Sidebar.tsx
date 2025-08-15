import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { getNavigationItems, NavigationItem } from '@/utils/navigation';
import { useCurrentUser } from '@/hooks/useAuth';
import { useLabQueue } from '@/hooks/useLab';
import { useInvoices } from '@/hooks/useBilling';

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
    const { orders: labQueue } = useLabQueue({ status: 'Pending' });
    const { invoices } = useInvoices({ status: 'Sent' });

    const toggleExpanded = (key: string) => {
        setExpandedItems(prev =>
            prev.includes(key)
                ? prev.filter(item => item !== key)
                : [...prev, key]
        );
    };

    const getBadgeCount = (key: string): number | undefined => {
        switch (key) {
            case 'lab-queue':
                return canViewLabQueue ? labQueue?.length : undefined;
            case 'invoices':
                return canViewInvoices ? invoices?.length : undefined;
            default:
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
                                "w-full justify-start gap-3 h-10",
                                level > 0 && "pl-8",
                                isActive && "bg-primary/10 text-primary"
                            )}
                        >
                            {item.icon}
                            <span className="flex-1 text-left">{item.label}</span>
                            {badgeCount && badgeCount > 0 && (
                                <Badge variant="secondary" className="ml-auto mr-2">
                                    {badgeCount}
                                </Badge>
                            )}
                            {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                            ) : (
                                <ChevronRight className="h-4 w-4" />
                            )}
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
                    "w-full justify-start gap-3 h-10",
                    level > 0 && "pl-8",
                    isActive && "bg-primary/10 text-primary"
                )}
            >
                <Link to={itemPath}>
                    {item.icon}
                    <span className="flex-1 text-left">{item.label}</span>
                    {badgeCount && badgeCount > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                            {badgeCount}
                        </Badge>
                    )}
                </Link>
            </Button>
        );
    };

    return (
        <div className={cn("flex h-full w-64 flex-col border-r bg-background", className)}>
            <div className="p-6">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">M</span>
                    </div>
                    <span className="font-bold text-lg">MediFlow</span>
                </Link>
            </div>

            <nav className="flex-1 space-y-1 p-4">
                {navigationItems.map(item => renderNavigationItem(item))}
            </nav>

            {/* Role indicator */}
            <div className="p-4 border-t">
                <div className="text-sm text-muted-foreground">
                    Logged in as <span className="font-medium">{userRole}</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;