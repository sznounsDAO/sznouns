import { ImageData as data, getNounData } from '@nouns/assets';
import { buildSVG } from '@nouns/sdk';
import { BigNumber as EthersBN } from 'ethers';
import { INounSeed, useNounSeed } from '../../wrappers/nounToken';
import Noun from '../Noun';
import { Link } from 'react-router-dom';
import classes from './StandaloneNoun.module.css';
import { useDispatch } from 'react-redux';
import { setOnDisplayAuctionNounId } from '../../state/slices/onDisplayAuction';
import nounClasses from '../Noun/Noun.module.css';

interface StandaloneNounProps {
  nounId: EthersBN;
}
interface StandaloneCircularNounProps {
  nounId: EthersBN;
}

interface StandaloneNounWithSeedProps {
  nounId: EthersBN;
  onLoadSeed?: (seed: INounSeed) => void;
  shouldLinkToProfile: boolean;
}

const getNoun = (nounId: string | EthersBN, seed: INounSeed) => {
  const id = nounId.toString();
  const name = `SZNoun ${id}`;
  const description = `SZNoun ${id} is a member of the SZNouns DAO`;
  const { parts, background } = getNounData(seed);
  const image = `data:image/svg+xml;base64,${btoa(buildSVG(parts, data.palette, background))}`;

  return {
    name,
    description,
    image,
    parts,
  };
};

const StandaloneNoun: React.FC<StandaloneNounProps> = (props: StandaloneNounProps) => {
  const { nounId } = props;
  const seed = useNounSeed(nounId);
  const noun = seed && getNoun(nounId, seed);

  const dispatch = useDispatch();

  const onClickHandler = () => {
    dispatch(setOnDisplayAuctionNounId(nounId.toNumber()));
  };

  return (
    <Link
      to={'/sznoun/' + nounId.toString()}
      className={classes.clickableNoun}
      onClick={onClickHandler}
    >
      <Noun imgPath={noun ? noun.image : ''} alt={noun ? noun.description : 'SZNoun'} />
    </Link>
  );
};

export const StandaloneNounCircular: React.FC<StandaloneCircularNounProps> = (
  props: StandaloneCircularNounProps,
) => {
  const { nounId } = props;
  const seed = useNounSeed(nounId);
  const noun = seed && getNoun(nounId, seed);

  const dispatch = useDispatch();
  const onClickHandler = () => {
    dispatch(setOnDisplayAuctionNounId(nounId.toNumber()));
  };

  return (
    <Link
      to={'/sznoun/' + nounId.toString()}
      className={classes.clickableNoun}
      onClick={onClickHandler}
    >
      <Noun
        imgPath={noun ? noun.image : ''}
        alt={noun ? noun.description : 'SZNoun'}
        wrapperClassName={nounClasses.circularNounWrapper}
        className={nounClasses.circular}
      />
    </Link>
  );
};

export const StandaloneNounRoundedCorners: React.FC<StandaloneNounProps> = (
  props: StandaloneNounProps,
) => {
  const { nounId } = props;
  const seed = useNounSeed(nounId);
  const noun = seed && getNoun(nounId, seed);

  const dispatch = useDispatch();
  const onClickHandler = () => {
    dispatch(setOnDisplayAuctionNounId(nounId.toNumber()));
  };

  return (
    <Link
      to={'/sznoun/' + nounId.toString()}
      className={classes.clickableNoun}
      onClick={onClickHandler}
    >
      <Noun
        imgPath={noun ? noun.image : ''}
        alt={noun ? noun.description : 'SZNoun'}
        className={nounClasses.rounded}
      />
    </Link>
  );
};

export const StandaloneNounWithSeed: React.FC<StandaloneNounWithSeedProps> = (
  props: StandaloneNounWithSeedProps,
) => {
  const { nounId, onLoadSeed, shouldLinkToProfile } = props;

  const dispatch = useDispatch();
  const seed = useNounSeed(nounId);
  const seedIsInvalid = Object.values(seed || {}).every(v => v === 0);

  if (!seed || seedIsInvalid || !nounId || !onLoadSeed) return <Noun imgPath="" alt="SZNoun" />;

  onLoadSeed(seed);

  const onClickHandler = () => {
    dispatch(setOnDisplayAuctionNounId(nounId.toNumber()));
  };

  const { image, description, parts } = getNoun(nounId, seed);

  const noun = <Noun imgPath={image} alt={description} parts={parts} />;
  const nounWithLink = (
    <Link
      to={'/sznoun/' + nounId.toString()}
      className={classes.clickableNoun}
      onClick={onClickHandler}
    >
      {noun}
    </Link>
  );
  return shouldLinkToProfile ? nounWithLink : noun;
};

export default StandaloneNoun;
