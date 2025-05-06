import React from "react";

const RobotImage = ({ path_in_assets, name_image }) => {
  return (
    <img
      src={`/src/assets/imgs/${path_in_assets}`} // Corrigido para template literal com chaves
      alt={name_image}
      className="w-28"
      id = {name_image}
    />
  );
};


export default RobotImage;
