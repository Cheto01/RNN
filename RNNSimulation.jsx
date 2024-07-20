import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, RotateCw, Pause, Play } from 'lucide-react';

const RNNSimulation = () => {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [hiddenState, setHiddenState] = useState(0);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [error, setError] = useState(0);
  const [gradients, setGradients] = useState({ dWya: 0, dWaa: 0, dWax: 0, dba: 0, dby: 0 });

  const inputSequence = [1, 2, 3];
  const weights = { Wax: 0.8, Waa: 0.6, Wya: 0.9 };
  const biases = { ba: 0.1, by: 0.2 };
  const learningRate = 0.1;
  const targetOutput = 0.5;  // Example target output

  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setTimeout(() => {
        handleNextStep();
      }, 2000);
    }
    return () => clearTimeout(timer);
  }, [isAutoPlaying, step, direction, animationStep]);

  useEffect(() => {
    if (direction === 'forward') {
      const newHiddenState = Math.tanh(
        weights.Wax * inputSequence[step] + weights.Waa * hiddenState + biases.ba
      );
      setHiddenState(parseFloat(newHiddenState.toFixed(2)));
    } else {
      // Backpropagation calculations
      const output = weights.Wya * hiddenState + biases.by;
      const newError = output - targetOutput;
      setError(parseFloat(newError.toFixed(2)));
      
      const dOutput = 1;  // Derivative of MSE with respect to output
      const dHiddenState = weights.Wya * dOutput * (1 - Math.pow(Math.tanh(hiddenState), 2));
      
      setGradients({
        dWya: parseFloat((dOutput * hiddenState).toFixed(2)),
        dWaa: parseFloat((dHiddenState * hiddenState).toFixed(2)),
        dWax: parseFloat((dHiddenState * inputSequence[step]).toFixed(2)),
        dba: parseFloat(dHiddenState.toFixed(2)),
        dby: parseFloat(dOutput.toFixed(2))
      });
    }
  }, [step, direction]);

  const handleNextStep = () => {
    if (animationStep < 2) {
      setAnimationStep(animationStep + 1);
    } else {
      setAnimationStep(0);
      if (direction === 'forward' && step < inputSequence.length - 1) {
        setStep(step + 1);
      } else if (direction === 'backward' && step > 0) {
        setStep(step - 1);
      } else if (direction === 'forward') {
        setDirection('backward');
        setStep(inputSequence.length - 1);
      } else {
        setDirection('forward');
        setStep(0);
      }
    }
  };

  const handlePrevStep = () => {
    if (animationStep > 0) {
      setAnimationStep(animationStep - 1);
    } else {
      setAnimationStep(2);
      if (direction === 'backward' && step > 0) {
        setStep(step - 1);
      } else if (direction === 'forward' && step > 0) {
        setStep(step - 1);
      } else if (direction === 'backward') {
        setDirection('forward');
        setStep(0);
      } else {
        setDirection('backward');
        setStep(inputSequence.length - 1);
      }
    }
  };

  const waxInput = parseFloat((weights.Wax * inputSequence[step]).toFixed(2));
  const waaHidden = parseFloat((weights.Waa * hiddenState).toFixed(2));
  const preActivation = parseFloat((waxInput + waaHidden + biases.ba).toFixed(2));
  const output = parseFloat((weights.Wya * hiddenState + biases.by).toFixed(2));

  const AnimatedArrow = ({ isActive, direction }) => {
    const baseClasses = "transition-all duration-500 w-24 h-1 ";
    const activeClasses = isActive ? "bg-blue-500" : "bg-gray-300";
    const directionClasses = direction === 'forward' ? "" : "transform rotate-180";
    return (
      <div className={`relative ${directionClasses}`}>
        <div className={baseClasses + activeClasses}></div>
        <div className={`absolute right-0 top-1/2 transform -translate-y-1/2 ${activeClasses}`} style={{width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: '10px solid currentColor'}}></div>
      </div>
    );
  };

  const NodeBox = ({ title, value, color }) => (
    <div className={`bg-${color}-100 p-4 rounded-lg shadow-md text-center w-40`}>
      <p className="text-sm font-semibold mb-2">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );

  const getStepExplanation = () => {
    if (direction === 'forward') {
      switch(animationStep) {
        case 0: return "Input is processed";
        case 1: return "Hidden state is updated";
        case 2: return "Output is generated";
        default: return "";
      }
    } else {
      switch(animationStep) {
        case 0: return "Error is calculated at the output";
        case 1: return "Error is propagated to hidden state";
        case 2: return "Gradients are computed";
        default: return "";
      }
    }
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto">
      <h2 className="text-4xl font-bold mb-8 text-center text-gray-800">RNN Simulation</h2>
      <div className="flex items-center justify-between mb-12">
        <NodeBox title="Input" value={inputSequence[step]} color="green" />
        <AnimatedArrow isActive={direction === 'forward' ? animationStep >= 1 : animationStep <= 1} direction={direction} />
        <NodeBox title="Hidden State" value={hiddenState} color="blue" />
        <AnimatedArrow isActive={direction === 'forward' ? animationStep >= 2 : animationStep <= 0} direction={direction} />
        <NodeBox title="Output" value={output} color="red" />
      </div>
      <div className="mb-8 text-center text-gray-600">
        <p className="mb-2">Direction: {direction === 'forward' ? 'Forward Propagation' : 'Backpropagation'}</p>
        <p className="mb-2">Step: {step + 1} / {inputSequence.length}</p>
        <p className="mb-2">Animation Step: {animationStep + 1} / 3</p>
        <p className="font-semibold">{getStepExplanation()}</p>
      </div>
      <div className="flex justify-center space-x-4 mb-8">
        <button onClick={handlePrevStep} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <ChevronLeft size={24} />
        </button>
        <button onClick={() => setIsAutoPlaying(!isAutoPlaying)} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
          {isAutoPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={handleNextStep} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <ChevronRight size={24} />
        </button>
        <button onClick={() => { setStep(0); setDirection('forward'); setAnimationStep(0); }} className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
          <RotateCw size={24} />
        </button>
      </div>
      <div className="bg-gray-100 p-6 rounded-lg shadow-inner">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">
          {direction === 'forward' ? 'Forward Propagation Calculations' : 'Backpropagation Calculations'}
        </h3>
        {direction === 'forward' ? (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-yellow-100 p-4 rounded-lg shadow">
                <p className="font-semibold mb-2">Wax * Input</p>
                <p className="text-lg font-bold">{waxInput}</p>
                <p className="text-sm text-gray-600">({weights.Wax} * {inputSequence[step]})</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg shadow">
                <p className="font-semibold mb-2">Waa * Previous Hidden</p>
                <p className="text-lg font-bold">{waaHidden}</p>
                <p className="text-sm text-gray-600">({weights.Waa} * {hiddenState})</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg shadow">
                <p className="font-semibold mb-2">Bias (ba)</p>
                <p className="text-lg font-bold">{biases.ba}</p>
              </div>
            </div>
            <div className="text-gray-700">
              <p className="mb-2">Pre-activation: {waxInput} + {waaHidden} + {biases.ba} = {preActivation}</p>
              <p>Activation: tanh({preActivation}) = {hiddenState}</p>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4">Error: {error} (Output - Target)</p>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-yellow-100 p-4 rounded-lg shadow">
                <p className="font-semibold mb-2">dWya</p>
                <p className="text-lg font-bold">{gradients.dWya}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg shadow">
                <p className="font-semibold mb-2">dWaa</p>
                <p className="text-lg font-bold">{gradients.dWaa}</p>
              </div>
              <div className="bg-purple-100 p-4 rounded-lg shadow">
                <p className="font-semibold mb-2">dWax</p>
                <p className="text-lg font-bold">{gradients.dWax}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg shadow">
                <p className="font-semibold mb-2">dba</p>
                <p className="text-lg font-bold">{gradients.dba}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg shadow">
                <p className="font-semibold mb-2">dby</p>
                <p className="text-lg font-bold">{gradients.dby}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RNNSimulation;