import { Fragment, Component } from 'inferno';
import { act } from '../byond';
import { AnimatedNumber, Box, Button, LabeledList, Section, Table, Grid } from '../components';
import { NumberInput } from '../components/NumberInput';
import { clamp } from 'common/math';

export const ChemMaster = props => {
  const { state, dispatch } = props;
  const { config, data } = state;
  const { ref } = config;
  const {
    screen,
    beakerContents = [],
    bufferContents = [],
    beakerCurrentVolume,
    beakerMaxVolume,
    pillStyles = [],
    chosenPillStyle,
    isBeakerLoaded,
    isPillBottleLoaded,
    pillBottleCurrentAmount,
    pillBottleMaxAmount,
  } = data;
  if (screen === 'analyze') {
    return <AnalysisResults state={state} />;
  }
  return (
    <Fragment>
      <Section
        title="Beaker"
        buttons={!!data.isBeakerLoaded && (
          <Fragment>
            <Box inline color="label" mr={2}>
              <AnimatedNumber
                value={beakerCurrentVolume}
                initial={0} />
              {` / ${beakerMaxVolume} units`}
            </Box>
            <Button
              icon="eject"
              content="Eject"
              onClick={() => act(ref, 'eject')} />
          </Fragment>
        )}>
        {!isBeakerLoaded && (
          <Box color="label" mt="3px" mb="5px">
            No beaker loaded.
          </Box>
        )}
        {!!isBeakerLoaded && beakerContents.length === 0 && (
          <Box color="label" mt="3px" mb="5px">
            Beaker is empty.
          </Box>
        )}
        <ChemicalBuffer>
          {beakerContents.map(chemical => (
            <ChemicalBufferEntry
              key={chemical.id}
              state={state}
              chemical={chemical}
              transferTo="buffer" />
          ))}
        </ChemicalBuffer>
      </Section>
      <Section
        title="Buffer"
        buttons={(
          <Fragment>
            <Box inline color="label" mr={1}>
              Mode:
            </Box>
            <Button
              color={data.mode ? 'good' : 'bad'}
              icon={data.mode ? 'exchange-alt' : 'times'}
              content={data.mode ? 'Transfer' : 'Destroy'}
              onClick={() => act(ref, 'toggleMode')} />
          </Fragment>
        )}>
        {bufferContents.length === 0 && (
          <Box color="label" mt="3px" mb="5px">
            Buffer is empty.
          </Box>
        )}
        <ChemicalBuffer>
          {bufferContents.map(chemical => (
            <ChemicalBufferEntry
              key={chemical.id}
              state={state}
              chemical={chemical}
              transferTo="beaker" />
          ))}
        </ChemicalBuffer>
      </Section>
      <Section
        title="Packaging">
        <PackagingControls state={state} />
      </Section>
      {!!isPillBottleLoaded && (
        <Section
          title="Pill Bottle"
          buttons={(
            <Fragment>
              <Box inline color="label" mr={2}>
                {pillBottleCurrentAmount} / {pillBottleMaxAmount} pills
              </Box>
              <Button
                icon="eject"
                content="Eject"
                onClick={() => act(ref, 'ejectPillBottle')} />
            </Fragment>
          )} />
      )}
    </Fragment>
  );
};

const ChemicalBuffer = Table;

const ChemicalBufferEntry = props => {
  const { state, chemical, transferTo } = props;
  const { ref } = state.config;
  return (
    <Table.Row key={chemical.id}>
      <Table.Cell color="label">
        <AnimatedNumber
          value={chemical.volume}
          initial={0} />
        {` units of ${chemical.name}`}
      </Table.Cell>
      <Table.Cell collapsing>
        <Button
          content="1"
          onClick={() => act(ref, 'transfer', {
            id: chemical.id,
            amount: 1,
            to: transferTo,
          })} />
        <Button
          content="5"
          onClick={() => act(ref, 'transfer', {
            id: chemical.id,
            amount: 5,
            to: transferTo,
          })} />
        <Button
          content="10"
          onClick={() => act(ref, 'transfer', {
            id: chemical.id,
            amount: 10,
            to: transferTo,
          })} />
        <Button
          content="All"
          onClick={() => act(ref, 'transfer', {
            id: chemical.id,
            amount: 1000,
            to: transferTo,
          })} />
        <Button
          icon="ellipsis-h"
          title="Custom amount"
          onClick={() => act(ref, 'transfer', {
            id: chemical.id,
            amount: -1,
            to: transferTo,
          })} />
        <Button
          icon="question"
          title="Analyze"
          onClick={() => act(ref, 'analyze', {
            id: chemical.id,
          })} />
      </Table.Cell>
    </Table.Row>
  );
};

const PackagingControlsItem = props => {
  const {
    label,
    amountUnit,
    amount,
    onChangeAmount,
    onCreate,
    sideNote,
  } = props;
  return (
    <LabeledList.Item label={label}>
      <NumberInput
        width={14}
        unit={amountUnit}
        step={1}
        stepPixelSize={15}
        value={amount}
        minValue={1}
        maxValue={10}
        onChange={onChangeAmount} />
      <Button ml={1}
        content="Create"
        onClick={onCreate} />
      <Box inline ml={1}
        color="label"
        content={sideNote} />
    </LabeledList.Item>
  );
};

class PackagingControls extends Component {
  constructor() {
    super();
    this.state = {
      pillAmount: 1,
      patchAmount: 1,
      bottleAmount: 1,
      packAmount: 1,
    };
  }

  render() {
    const { state, props } = this;
    const { ref } = props.state.config;
    const {
      pillAmount,
      patchAmount,
      bottleAmount,
      packAmount,
    } = this.state;
    const {
      condi,
      chosenPillStyle,
      pillStyles = [],
    } = props.state.data;
    return (
      <LabeledList>
        {!condi && (
          <LabeledList.Item label="Pill type">
            {pillStyles.map(pill => (
              <Button
                key={pill.id}
                width={5}
                selected={pill.id === chosenPillStyle}
                textAlign="center"
                color="transparent"
                onClick={() => act(ref, 'pillStyle', { id: pill.id })}>
                <Box mx={-1} className={pill.className} />
              </Button>
            ))}
          </LabeledList.Item>
        )}
        {!condi && (
          <PackagingControlsItem
            label="Pills"
            amount={pillAmount}
            amountUnit="pills"
            sideNote="max 50u"
            onChangeAmount={(e, value) => this.setState({
              pillAmount: value,
            })}
            onCreate={() => act(ref, 'create', {
              type: 'pill',
              amount: pillAmount,
              volume: 'auto',
            })} />
        )}
        {!condi && (
          <PackagingControlsItem
            label="Patches"
            amount={patchAmount}
            amountUnit="patches"
            sideNote="max 40u"
            onChangeAmount={(e, value) => this.setState({
              patchAmount: value,
            })}
            onCreate={() => act(ref, 'create', {
              type: 'patch',
              amount: patchAmount,
              volume: 'auto',
            })} />
        )}
        {!condi && (
          <PackagingControlsItem
            label="Bottles"
            amount={bottleAmount}
            amountUnit="bottles"
            sideNote="max 30u"
            onChangeAmount={(e, value) => this.setState({
              bottleAmount: value,
            })}
            onCreate={() => act(ref, 'create', {
              type: 'bottle',
              amount: bottleAmount,
              volume: 'auto',
            })} />
        )}
        {!!condi && (
          <PackagingControlsItem
            label="Packs"
            amount={packAmount}
            amountUnit="packs"
            sideNote="max 10u"
            onChangeAmount={(e, value) => this.setState({
              packAmount: value,
            })}
            onCreate={() => act(ref, 'create', {
              type: 'condimentPack',
              amount: packAmount,
              volume: 'auto',
            })} />
        )}
        {!!condi && (
          <PackagingControlsItem
            label="Bottles"
            amount={bottleAmount}
            amountUnit="bottles"
            sideNote="max 50u"
            onChangeAmount={(e, value) => this.setState({
              bottleAmount: value,
            })}
            onCreate={() => act(ref, 'create', {
              type: 'condimentBottle',
              amount: bottleAmount,
              volume: 'auto',
            })} />
        )}
      </LabeledList>
    );
  }
}

const AnalysisResults = props => {
  const { state } = props;
  const { ref } = state.config;
  const { analyzeVars } = state.data;
  return (
    <Section
      title="Analysis Results"
      buttons={(
        <Button
          icon="arrow-left"
          content="Back"
          onClick={() => act(ref, 'goScreen', {
            screen: 'home',
          })} />
      )}>
      <LabeledList>
        <LabeledList.Item label="Name">
          {analyzeVars.name}
        </LabeledList.Item>
        <LabeledList.Item label="State">
          {analyzeVars.state}
        </LabeledList.Item>
        <LabeledList.Item label="Color">
          <Box inline
            mr={1}
            width={2}
            height={2}
            lineHeight={2}
            content="."
            style={{
              'color': analyzeVars.color,
              'background-color': analyzeVars.color,
            }} />
          {analyzeVars.color}
        </LabeledList.Item>
        <LabeledList.Item label="Description">
          {analyzeVars.description}
        </LabeledList.Item>
        <LabeledList.Item label="Metabolization Rate">
          {analyzeVars.metaRate} u/minute
        </LabeledList.Item>
        <LabeledList.Item label="Overdose Threshold">
          {analyzeVars.overD}
        </LabeledList.Item>
        <LabeledList.Item label="Addiction Threshold">
          {analyzeVars.addicD}
        </LabeledList.Item>
      </LabeledList>
    </Section>
  );
};
