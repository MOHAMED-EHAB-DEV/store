import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "@/components/ui/svgs/icons/ChevronRight";
import { MoreVertical } from "@/components/ui/svgs/icons/MoreVertical";
import { cn } from "@/lib/utils";

export interface BreadcrumbProps extends React.ComponentPropsWithoutRef<"nav"> {
  separator?: React.ReactNode;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ ...props }, ref) => <nav ref={ref} aria-label="Breadcrumb" {...props} />
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(({ className, ...props }, ref) => (
  <ol
    ref={ref}
    className={cn(
      "flex flex-wrap items-center gap-1.5 sm:gap-2 break-words text-xs sm:text-sm text-gray-400",
      className
    )}
    {...props}
  />
));
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    className={cn("inline-flex items-center gap-1.5 sm:gap-2", className)}
    {...props}
  />
));
BreadcrumbItem.displayName = "BreadcrumbItem";

export interface BreadcrumbLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  asChild?: boolean;
}

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "transition-colors hover:text-white focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-purple-400 rounded-xs",
          className
        )}
        {...props}
      />
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    role="link"
    aria-disabled="true"
    aria-current="page"
    className={cn("font-medium text-gray-200", className)}
    {...props}
  />
));
BreadcrumbPage.displayName = "BreadcrumbPage";

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) => (
  <li
    role="presentation"
    aria-hidden="true"
    className={cn("text-gray-600 [&>svg]:size-3.5 rtl:rotate-180", className)}
    {...props}
  >
    {children ?? <ChevronRight className="size-3.5" />}
  </li>
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    role="presentation"
    aria-hidden="true"
    className={cn("flex size-5 items-center justify-center text-gray-500", className)}
    {...props}
  >
    <MoreVertical className="size-4" />
    <span className="sr-only">More</span>
  </span>
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export interface DynamicBreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  isCurrent?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export interface BreadcrumbsProps extends React.ComponentPropsWithoutRef<"nav"> {
  items: DynamicBreadcrumbItem[];
  separator?: React.ReactNode;
  listClassName?: string;
  itemClassName?: string;
  linkClassName?: string;
  pageClassName?: string;
  ariaLabel?: string;
}

export function Breadcrumbs({
  items,
  separator,
  className,
  listClassName,
  itemClassName,
  linkClassName,
  pageClassName,
  ariaLabel = "Breadcrumb",
  ...props
}: BreadcrumbsProps) {
  if (!items || items.length === 0) return null;

  return (
    <Breadcrumb aria-label={ariaLabel} className={className} {...props}>
      <BreadcrumbList className={listClassName}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrent = item.isCurrent ?? isLast;
          const Icon = item.icon;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem className={cn(itemClassName, item.className)}>
                {isCurrent || !item.href ? (
                  <BreadcrumbPage className={cn(pageClassName, item.className)}>
                    {Icon && <Icon className="size-3.5 inline-block me-1.5" />}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    href={item.href}
                    className={cn(linkClassName, item.className)}
                  >
                    {Icon && <Icon className="size-3.5 inline-block me-1.5" />}
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && (
                <BreadcrumbSeparator>
                  {separator}
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};

export default Breadcrumbs;
