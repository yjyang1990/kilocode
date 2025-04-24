import React from 'react';

const Image = ({ src, alt, width }) => {
  return (
    <center>
      <img src={src} alt={alt} width={width} />
    </center>
  );
};

export default Image;