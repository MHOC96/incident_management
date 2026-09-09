type DetailJumpLinksProps = { actions?: boolean; messages?: boolean };

export function DetailJumpLinks({ actions = false, messages = true }: DetailJumpLinksProps) {
  return (
    <nav aria-label="Incident sections" className="detail-jump-links">
      {actions && <a href="#incident-actions">Actions</a>}
      {messages && <a href="#incident-messages">Communication</a>}
      <a href="#incident-timeline">Progress</a>
    </nav>
  );
}
