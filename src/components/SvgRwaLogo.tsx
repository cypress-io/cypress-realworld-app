import * as React from "react";

function SvgRwaLogo(props: any) {
  return (
    <svg
      width="300px"
      height="65px"
      viewBox="0 0 480 100"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="FinTechCo logo"
      style={{ display: 'block', margin: '0 auto' }}
      {...props}
    >
      <g fill="currentColor">
        {/* Icon: simplified bank building */}
        <g transform="translate(0,8)">
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

        {/* Wordmark */}
        <g transform="translate(95,68)">
          <text
            x="0" y="0"
            fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
            fontSize="52"
            fontWeight="700"
            letterSpacing="-0.5"
          >FinTechCo</text>

          {/* Small descriptor */}
          <text
            x="2" y="30"
            fontFamily="Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
            fontSize="16"
            fontWeight="600"
            opacity="0.85"
            letterSpacing="1.5"
          >DIGITAL BANKING</text>
        </g>
      </g>
    </svg>
  );
}

export default SvgRwaLogo;
