import { memo } from "react";

function AdminCard({
  title,
  subtitle,
  actions,
  children,
  className = "",
  headerClassName = "",
}) {
  const cardClass = ["admin-card", className].filter(Boolean).join(" ");
  const headerClass = ["admin-card__header", headerClassName]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={cardClass}>
      {(title || subtitle || actions) && (
        <header className={headerClass}>
          <div>
            {title && <h3 className="admin-card__title">{title}</h3>}
            {subtitle && <p className="admin-card__subtitle">{subtitle}</p>}
          </div>
          {actions && <div className="admin-card__actions">{actions}</div>}
        </header>
      )}
      {children}
    </section>
  );
}

export default memo(AdminCard);
