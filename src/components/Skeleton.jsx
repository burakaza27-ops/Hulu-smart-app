import './Skeleton.css';

export function SkeletonCard({ width = '100%', height = 80 }) {
  return <div className="skeleton-card" style={{ width, height }} />;
}

export function SkeletonLine({ width = '100%', height = 14 }) {
  return <div className="skeleton-line" style={{ width, height }} />;
}

export function SkeletonAvatar({ size = 44 }) {
  return <div className="skeleton-avatar" style={{ width: size, height: size }} />;
}

export function SkeletonTransaction() {
  return (
    <div className="skeleton-tx">
      <SkeletonAvatar size={42} />
      <div className="skeleton-tx-text">
        <SkeletonLine width="60%" />
        <SkeletonLine width="35%" height={10} />
      </div>
      <SkeletonLine width={60} />
    </div>
  );
}
