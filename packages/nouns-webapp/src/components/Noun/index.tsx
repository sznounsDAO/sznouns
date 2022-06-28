import classes from './Noun.module.css';
import React from 'react';
import loadingNoun from '../../assets/loading-skull-noun.gif';
import Image from 'react-bootstrap/Image';
import SZNounTraitsOverlay from '../SZNounTraitsOverlay';

export const LoadingNoun = () => {
  return (
    <div className={classes.imgWrapper}>
      <Image className={classes.img} src={loadingNoun} alt={'loading noun'} fluid />
    </div>
  );
};

const Noun: React.FC<{
  imgPath: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  parts?: { filename: string }[];
}> = props => {
  const { imgPath, alt, className, parts, wrapperClassName } = props;
  console.log('parts: ', parts);
  return (
    <div className={`${classes.imgWrapper} ${wrapperClassName}`} data-tip data-for="noun-traits">
      <Image
        className={`${classes.img} ${className}`}
        src={imgPath ? imgPath : loadingNoun}
        alt={alt}
        fluid
      />
      {Boolean(parts?.length) && <SZNounTraitsOverlay parts={parts!} />}
    </div>
  );
};

export default Noun;
