import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  linkToHome?: boolean;
}

const sizes = {
  sm: { img: 'h-8 w-8', text: 'text-base' },
  md: { img: 'h-10 w-10', text: 'text-xl' },
  lg: { img: 'h-14 w-14', text: 'text-2xl' },
};

export default function Logo({
  size = 'md',
  showText = true,
  linkToHome = true,
}: LogoProps) {
  const s = sizes[size];

  const content = (
    <div className="flex items-center gap-3 group">
      <div
        className={`${s.img} relative shrink-0 rounded-xl bg-gradient-to-br from-emerald-500/20 to-transparent p-0.5 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/10 transition group-hover:ring-emerald-400/50 group-hover:shadow-emerald-500/20`}
      >
        <img
          src="/logo.svg"
          alt="FIFA Torneo"
          className="h-full w-full rounded-[10px]"
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-display ${s.text} tracking-wider text-white uppercase`}
          >
            FIFA
          </span>
          <span className="font-display text-xs tracking-[0.35em] text-emerald-400 uppercase mt-0.5">
            Torneo
          </span>
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to="/" className="inline-flex hover:opacity-90 transition">
        {content}
      </Link>
    );
  }

  return content;
}
