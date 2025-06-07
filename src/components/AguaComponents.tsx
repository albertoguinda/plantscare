import CardComponent from "./CardComponent";

const temperatureData = [
  { month: "Ene", value: 22 },
  { month: "Feb", value: 23 },
  { month: "Mar", value: 24 },
  { month: "Abr", value: 22 },
  { month: "May", value: 21 },
  { month: "Jun", value: 23 },
  { month: "Jul", value: 25 },
  { month: "Ago", value: 26 },
  { month: "Sep", value: 24 },
  { month: "Oct", value: 22 },
  { month: "Nov", value: 23 },
  { month: "Dic", value: 22 },
];

const phData = [
  { month: "Ene", value: 60 },
  { month: "Feb", value: 58 },
  { month: "Mar", value: 65 },
  { month: "Abr", value: 70 },
  { month: "May", value: 72 },
  { month: "Jun", value: 68 },
  { month: "Jul", value: 66 },
  { month: "Ago", value: 64 },
  { month: "Sep", value: 67 },
  { month: "Oct", value: 69 },
  { month: "Nov", value: 70 },
  { month: "Dic", value: 68 },
];

const ecData = [
  { month: "Ene", value: 400 },
  { month: "Feb", value: 420 },
  { month: "Mar", value: 430 },
  { month: "Abr", value: 450 },
  { month: "May", value: 440 },
  { month: "Jun", value: 460 },
  { month: "Jul", value: 480 },
  { month: "Ago", value: 500 },
  { month: "Sep", value: 470 },
  { month: "Oct", value: 450 },
  { month: "Nov", value: 430 },
  { month: "Dic", value: 410 },
];

const fosforoData = [
  { month: "Ene", value: 800 },
  { month: "Feb", value: 850 },
  { month: "Mar", value: 900 },
  { month: "Abr", value: 750 },
  { month: "May", value: 720 },
  { month: "Jun", value: 810 },
  { month: "Jul", value: 830 },
  { month: "Ago", value: 870 },
  { month: "Sep", value: 900 },
  { month: "Oct", value: 880 },
  { month: "Nov", value: 860 },
  { month: "Dic", value: 840 },
];

const potasioData = [
  { month: "Ene", value: 800 },
  { month: "Feb", value: 850 },
  { month: "Mar", value: 900 },
  { month: "Abr", value: 750 },
  { month: "May", value: 720 },
  { month: "Jun", value: 810 },
  { month: "Jul", value: 830 },
  { month: "Ago", value: 870 },
  { month: "Sep", value: 900 },
  { month: "Oct", value: 880 },
  { month: "Nov", value: 860 },
  { month: "Dic", value: 840 },
];

const calcioData = [
  { month: "Ene", value: 800 },
  { month: "Feb", value: 850 },
  { month: "Mar", value: 900 },
  { month: "Abr", value: 750 },
  { month: "May", value: 720 },
  { month: "Jun", value: 810 },
  { month: "Jul", value: 830 },
  { month: "Ago", value: 870 },
  { month: "Sep", value: 900 },
  { month: "Oct", value: 880 },
  { month: "Nov", value: 860 },
  { month: "Dic", value: 840 },
];

const Agua = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-8 xl:px-12 w-full mx-auto py-12">
      <CardComponent
        title="🌡️ Temperatura"
        unit="°C"
        chartData={temperatureData}
        color="#FF5733"
      />
      <CardComponent title="🧪 pH" unit="" chartData={phData} color="#3498DB" />
      <CardComponent
        title="⚡ EC"
        unit="µS/cm"
        chartData={ecData}
        color="#2ECC71"
      />
      <CardComponent
        title="🟣 Fósforo"
        unit="mg/L"
        chartData={fosforoData}
        color="#9B59B6"
      />
      <CardComponent
        title="🟠 Potasio"
        unit="mg/L"
        chartData={potasioData}
        color="#E67E22"
      />
      <CardComponent
        title="⚪ Calcio"
        unit="mg/L"
        chartData={calcioData}
        color="#BDC3C7"
      />
    </div>
  );
};

export default Agua;
