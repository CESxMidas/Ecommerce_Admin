import { memo } from "react";

import "./PageHeader.css";

function PageHeader({ title, breadcrumb, actions }) {
  return (
    <header className="page-header">
      <div className="page-header__main">
        <h1 className="admin-page-title">{title}</h1>
        {breadcrumb && (
          <nav className="admin-breadcrumb" aria-label="Breadcrumb">
            {breadcrumb}
          </nav>
        )}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
}

export default memo(PageHeader);
