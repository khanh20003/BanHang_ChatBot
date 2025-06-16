import { useState, useEffect } from "react";

const SectionTitle = ({ title, subTitle }) => {
  return (
    <div className="section-title text-center mb-12">
      {subTitle && (
        <p className="text-sm text-gray-500 uppercase font-semibold mb-2">
          {subTitle}
        </p>
      )}
      <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
    </div>
  );
};

const SectionTitleContainer = () => {
  const [data, setData] = useState({ title: "", subTitle: "" });

  useEffect(() => {
    fetch("http://localhost:8000/section-title")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.error(err));
  }, []);

  return <SectionTitle title={data.title} subTitle={data.subTitle} />;
};

export default SectionTitleContainer;
