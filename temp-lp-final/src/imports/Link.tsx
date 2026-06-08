import imgSolarBuySide from "figma:asset/732268ab181c1df4e3d82aab30d93853c465dba5.png";

function SolarBuySide() {
  return (
    <div className="-translate-y-1/2 absolute h-[64px] left-0 top-1/2 w-[63.65px]" data-name="Solar Buy-Side">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-full left-[-0.01%] max-w-none top-0 w-[100.01%]" src={imgSolarBuySide} />
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="absolute h-[28px] left-[75.65px] overflow-clip top-[18px] w-[45.35px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Segoe_UI:Bold',sans-serif] h-[26.4px] justify-center leading-[0] left-0 not-italic text-[20px] text-shadow-[0px_2px_4px_rgba(0,0,0,0.3)] text-white top-[14px] tracking-[-0.5px] w-[45.966px]">
        <p className="leading-[28px] whitespace-pre-wrap">Solar</p>
      </div>
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute h-[28px] left-[125px] overflow-clip top-[18px] w-[79.88px]" data-name="Container">
      <div className="-translate-y-1/2 absolute flex flex-col font-['Segoe_UI:Bold',sans-serif] h-[26.4px] justify-center leading-[0] left-0 not-italic text-[#f97316] text-[20px] text-shadow-[0px_2px_4px_rgba(0,0,0,0.3)] top-[14px] tracking-[-0.5px] w-[80.45px]">
        <p className="leading-[28px] whitespace-pre-wrap">Buy-Side</p>
      </div>
    </div>
  );
}

export default function Link() {
  return (
    <div className="relative size-full" data-name="Link">
      <SolarBuySide />
      <Container />
      <Container1 />
    </div>
  );
}