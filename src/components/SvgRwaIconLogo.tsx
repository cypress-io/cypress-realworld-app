import * as React from "react";

function SvgRwaIconLogo(props: any) {
  return (
    <svg
      width="45px"
      height="45px"
      viewBox="0 0 90 90"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="FinTechCo icon"
      {...props}
    >
      <g fill="currentColor" transform="translate(5,5)">
        {/* Roof */}
        <path d="M40 0 L80 18 L0 18 Z" />
        {/* Entablature */}
        <rect x="5" y="20" width="70" height="7" rx="1.5"/>
        {/* Columns */}
        <rect x="11" y="30" width="9" height="39" rx="1.5"/>
        <rect x="27" y="30" width="9" height="39" rx="1.5"/>
        <rect x="43" y="30" width="9" height="39" rx="1.5"/>
        <rect x="59" y="30" width="9" height="39" rx="1.5"/>
        {/* Base */}
        <rect x="3" y="71" width="74" height="8" rx="1.5"/>
        {/* Steps */}
        <rect x="8" y="81" width="64" height="5" rx="1.5"/>
        <rect x="13" y="88" width="54" height="4" rx="1.5"/>
      </g>
    </svg>
  );
}

export default SvgRwaIconLogo;
