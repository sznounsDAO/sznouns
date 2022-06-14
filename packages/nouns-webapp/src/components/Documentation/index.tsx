import Section from '../../layout/Section';
import { Col } from 'react-bootstrap';
import classes from './Documentation.module.css';
import Accordion from 'react-bootstrap/Accordion';
import Link from '../Link';

const Documentation = () => {
  const sznsLink = <Link text="SZNS" url="http://szns.io" leavesPage={true} />;
  const albumsLink = (
    <Link text="Albums" url="https://docs.szns.io/core-components/albums" leavesPage={true} />
  );
  const nounsLink = <Link text="here" url="http://nouns.wtf" leavesPage={true} />;
  const playgroundLink = <Link text={'Playground'} url="/playground" leavesPage={false} />;
  const publicDomainLink = (
    <Link
      text={'public domain'}
      url="https://creativecommons.org/publicdomain/zero/1.0/"
      leavesPage={true}
    />
  );
  const compoundGovLink = (
    <Link
      text={'Compound Governance'}
      url="https://compound.finance/governance"
      leavesPage={true}
    />
  );
  return (
    <Section fullWidth={false}>
      <Col lg={{ span: 10, offset: 1 }}>
        <div className={classes.headerWrapper}>
          <h1>WTF?</h1>

          <p className={classes.aboutText}>
            SZNouns is an experiment in cc0 and governance made for the community by the {sznsLink}{' '}
            team, inspired by the Nouns DAO. We hope to be a premier subDAO of Nouns, contributing
            to both the Nouns and broader NFT &amp; DAO ecosystems.
          </p>
          <p className={classes.aboutText}>
            The SZNS team has been at the forefront of exploring DAO tooling for NFT communities via
            the SZNS protocol, where anyone can deploy {albumsLink} to manage NFT assets as a DAO.
          </p>
          <p className={classes.aboutText}>
            The Nouns Project is the one of the first successful projects to bootstrap a completely
            community-owned identity, governance, and treasury. Find out more about Nouns{' '}
            {nounsLink}.
          </p>
          <p className={classes.aboutText}>Learn more about SZNouns below.</p>
          <p className={classes.aboutText} style={{ paddingBottom: '3rem' }}>
            ⌐◨-◨ <span className={classes.emoji}>&#10084;</span> ◐-◐¬
          </p>
        </div>
        <Accordion flush>
          <Accordion.Item eventKey="0" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>Summary</Accordion.Header>
            <Accordion.Body>
              <ul>
                <li>SZNouns artwork is in the {publicDomainLink}.</li>
                <li>
                  One SZNoun is trustlessly auctioned *at least* once a day (depending on the
                  Season), forever.
                </li>
                <li>
                  100% of the auction proceeds are trustlessly sent to the treasury to be managed by
                  the SZNoun DAO.
                </li>
                <li>Settlement of one auction kicks off the next.</li>
                <li>All SZNouns are members of SZNouns DAO.</li>
                <li>SZNouns DAO uses a fork of {compoundGovLink}, also used by the Nouns DAO.</li>
                <li>One SZNoun is equal to one vote.</li>
                <li>The treasury is controlled exclusively by SZNouns via governance.</li>
                <li>Artwork is generative and stored directly on-chain (not IPFS).</li>
                <li>
                  No explicit rules exist for attribute scarcity; all SZNouns are equally rare.
                </li>
                <li>
                  SZNounders receive rewards in the form of SZNouns (5% of supply for the first 5
                  years).
                </li>
                <li>The Nouns DAO will also receive 5% of supply for the first 5 years.</li>
              </ul>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey="1" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>Daily Auctions</Accordion.Header>
            <Accordion.Body>
              <p className={classes.aboutText}>
                The SZNouns Auction Contract will act as a self-sufficient SZNoun generation and
                distribution mechanism, auctioning one SZNoun at least once a day, depending on the
                Season, forever.
              </p>
              <p className={classes.aboutText} style={{ paddingBottom: '1rem' }}>
                There are 4 seasons of minting:
              </p>
              <ul>
                <li>Winter, beginning 12/1: once a day auctions</li>
                <li>Spring, beginning 3/1: twice a day, every 12 hours</li>
                <li>Summer, beginning 5/1: four times a day, every 6 hours</li>
                <li>Fall, beginning 8/1: twice a day, every 12 hours</li>
              </ul>
              <p className={classes.aboutText}>
                100% of auction proceeds (ETH) are automatically deposited in the SZNouns DAO
                treasury, where they are governed by SZNoun owners.
              </p>
              <p className={classes.aboutText}>
                Each time an auction is settled, the settlement transaction will also cause a new
                SZNoun to be minted and a new 24 hour auction to begin.
              </p>
              <p className={classes.aboutText}>
                While settlement is most heavily incentivized for the winning bidder, it can be
                triggered by anyone, allowing the system to trustlessly auction SZNouns as long as
                Ethereum is operational and there are interested bidders.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="2" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>SZNouns DAO</Accordion.Header>
            <Accordion.Body>
              Like the Nouns DAO, SZNouns DAO utilizes a fork of {compoundGovLink} and is the main
              governing body of the SZNouns ecosystem. The SZNouns DAO treasury receives 100% of ETH
              proceeds from daily SZNoun auctions. Each SZNoun is an irrevocable member of SZNouns
              DAO and entitled to one vote in all governance matters. SZNoun votes are
              non-transferable (if you sell your SZNoun the vote goes with it) but delegatable,
              which means you can assign your vote to someone else as long as you own your SZNoun.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="3" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              Governance ‘Slow Start’
            </Accordion.Header>
            <Accordion.Body>
              <p>
                In addition to the precautions taken by Compound Governance, SZNounders have given
                themselves a special veto right to ensure that no malicious proposals can be passed
                while the SZNoun supply is low. This veto right will only be used if an obviously
                harmful governance proposal has been passed, and is intended as a last resort.
              </p>
              <p>
                SZNounders will proveably revoke this veto right when they deem it safe to do so.
                This decision will be based on a healthy SZNoun distribution and a community that is
                engaged in the governance process.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="4" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>SZNoun Traits</Accordion.Header>
            <Accordion.Body>
              <p>
                SZNouns are generated randomly based Ethereum block hashes. There are no 'if'
                statements or other rules governing SZNoun trait scarcity, which makes all SZNouns
                equally rare. As of this writing, SZNouns are made up of:
              </p>
              <ul>
                <li>backgrounds (2)</li>
                <li>bodies (30)</li>
                <li>accessories (137)</li>
                <li>heads (234)</li>
                <li>glasses (21)</li>
              </ul>
              You can experiment with off-chain SZNoun generation at the {playgroundLink}.
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="5" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              On-Chain Artwork
            </Accordion.Header>
            <Accordion.Body>
              <p>
                SZNouns are stored directly on Ethereum and do not utilize pointers to other
                networks such as IPFS. This is possible because SZNoun parts are compressed and
                stored on-chain using a custom run-length encoding (RLE), which is a form of
                lossless compression.
              </p>
              <p>
                The compressed parts are efficiently converted into a single base64 encoded SVG
                image on-chain. To accomplish this, each part is decoded into an intermediate format
                before being converted into a series of SVG rects using batched, on-chain string
                concatenation. Once the entire SVG has been generated, it is base64 encoded.
              </p>
              <p>
                In order to generate the circle SZNouns glasses ◐-◐¬, the SZNounders have rewritten
                the SVG conversion algorithm such that the circular glasses are drawn entirely
                algorithmically based on the glasses of the OG Nouns.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="6" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              SZNoun Seeder Contract
            </Accordion.Header>
            <Accordion.Body>
              <p>
                The SZNoun Seeder contract is used to determine SZNoun traits during the minting
                process. The seeder contract can be replaced to allow for future trait generation
                algorithm upgrades. Additionally, it can be locked by the SZNouns DAO to prevent any
                future updates. Currently, SZNoun traits are determined using pseudo-random number
                generation:
              </p>
              <code>keccak256(abi.encodePacked(blockhash(block.number - 1), nounId))</code>
              <br />
              <p>
                Trait generation is not truly random. Traits can be predicted when minting a SZNoun
                on the pending block.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="7" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              SZNounder's Reward
            </Accordion.Header>
            <Accordion.Body>
              <p>
                'SZNounders' are the group of builders that initiated SZNouns. Here are the
                SZNounders:
              </p>
              <ul>
                <li>
                  <Link text="The SZNS team" url="https://twitter.com/" leavesPage={true} />
                </li>
                <li>
                  <Link text="0xd" url="https://twitter.com/" leavesPage={true} />
                </li>
                <li>
                  <Link text="minci" url="https://twitter.com/" leavesPage={true} />
                </li>
                <li>
                  <Link text="0xgoretex" url="https://twitter.com/" leavesPage={true} />
                </li>
                <li>
                  <Link text="Brent" url="https://twitter.com/" leavesPage={true} />
                </li>
                <li>
                  <Link text="XX" url="https://twitter.com/" leavesPage={true} />
                </li>
                <li>
                  <Link text="XX" url="https://twitter.com/" leavesPage={true} />
                </li>
                <li>
                  <Link text="XX" url="https://twitter.com/" leavesPage={true} />
                </li>
              </ul>
              <p>
                Because 100% of SZNoun auction proceeds are sent to SZNouns DAO, SZNounders have
                chosen to compensate themselves with SZNouns. Every 20th SZNoun for the first 5
                years of the project (Noun ids #0, #20, #40, #60, #80, and so on) will be
                automatically sent to the SZNounder's multisig to be vested and shared among the
                founding members of the project. This is equivalent to approximately 5% of total
                supply in the first five years.
              </p>
              <p>
                SZNounder distributions don't interfere with the cadence of auctions. SZNouns are
                sent directly to the SZNounder's Multisig, and auctions continue on schedule with
                the next available SZNoun ID.
              </p>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="8" className={classes.accordionItem}>
            <Accordion.Header className={classes.accordionHeader}>
              Nouns DAO's Reward
            </Accordion.Header>
            <Accordion.Body>
              <p>
                As we aspire to become the most premier subDAO for the Nouns ecosystem, SZNounders
                have chosen to compensate the Nouns DAO with SZNouns, for being selfless stewards of
                cc0 and open-source. Every second SZNoun at every 20th for the first 5 years of the
                project (SZNoun ids #19, #38, #57, #76, and so on) will be automatically sent to the
                Nouns DAO to be vested and shared among members of the project. This is equivalent
                to approximately 5% of total supply in the first five years.
              </p>
              <p>
                Nouns DAO distributions don't interfere with the cadence of auctions. SZNouns are
                sent directly to the Nouns DAO Treasury, and auctions continue on schedule with the
                next available SZNoun ID.
              </p>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Col>
    </Section>
  );
};
export default Documentation;
