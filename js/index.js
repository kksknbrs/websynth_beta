"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Voice = function () {
    function Voice(ctx, oscNum, freq, waveform, volume) {
        _classCallCheck(this, Voice);

        this.voice = ctx.createOscillator();
        this.voice.type = waveform;
        this.voice.frequency.value = freq;

        this.phaseSlider = ctx.createDelay(); //位相をずらす役割
        this.phaseSlider.delayTime.value = Math.random() / this.voice.frequency.value; //音の周波数で割ることで1周期の範囲で位相をずらす
        this.panner = ctx.createStereoPanner();
        this.volume = ctx.createGain();
        this.volume.gain.value = volume;

        this.voice.connect(this.phaseSlider);
        this.phaseSlider.connect(this.panner);
        this.panner.connect(this.volume);
    }

    _createClass(Voice, [{
        key: "getNode",
        value: function getNode() {
            return this.volume;
        }
    }]);

    return Voice;
}();

var VoiceContainer = function () {
    function VoiceContainer(ctx, oscNum, freq) {
        _classCallCheck(this, VoiceContainer);

        this.ctx = ctx;
        this.octave = document.getElementById("octave" + oscNum).value;
        this.freq = freq * Math.pow(2, this.octave);
        this.waveform = document.getElementById("waveform" + oscNum).value;
        this.numVoice = document.getElementById("numVoice" + oscNum).value;
        this.detune = document.getElementById("detune" + oscNum).value;
        this.volume = document.getElementById("volume" + oscNum).value;
        this.voices = [];
        for (var i = 0; i < this.numVoice; i++) {
            this.voices[i] = new Voice(this.ctx, oscNum, this.freq, this.waveform, this.volume);
        }
    }

    _createClass(VoiceContainer, [{
        key: "scatterPan",
        value: function scatterPan(oscNum) {
            this.pan = document.getElementById("stereo" + oscNum).value;
            var pan = this.pan;
            var panBetweenVoices = this.numVoice % 2 === 0 ? this.pan / (this.numVoice / 2) : this.pan / ((this.numVoice - 1) / 2);
            if (this.numVoice % 2 === 0) {
                panBetweenVoices = this.pan / (this.numVoice / 2);
            } else {
                panBetweenVoices = this.pan / ((this.numVoice - 1) / 2);
            }

            var startIndex = this.numVoice % 2 === 0 ? 0 : 1;
            var playingVCO = synth.getPlayingVCO();

            for (var i = 0; i < playingVCO.length; i++) {
                for (var j = startIndex; j < this.numVoice - 1; j += 2) {
                    playingVCO[i].voices[j].panner.pan.value = pan;
                    playingVCO[i].voices[j + 1].panner.pan.value = -pan;
                    pan -= panBetweenVoices;
                }
                pan = this.pan;
            }
        }
    }, {
        key: "setDetune",
        value: function setDetune(oscNum) {
            // 各オシレーター(voice)のdetuneを0を中心として等間隔にずらす
            // 例(voiceNum==4 偶数の時): 低い<= [1] [3] 0(中心) [2] [0] =>高い  外側から順に配置
            // 例(voiceNum==5 奇数の時): 低い<= [2] [4] [0](detuneしない) [3] [1] =>高い 　detuneしない音を置いてから外側から配置    
            this.detune = document.getElementById("detune" + oscNum).value;
            var detune = this.detune;
            var detuneBetweenVoices = void 0;
            if (this.numVoice % 2 === 0) {
                detuneBetweenVoices = this.detune / (this.numVoice / 2);
            } else {
                detuneBetweenVoices = this.detune / ((this.numVoice - 1) / 2);
            }

            var startIndex = this.numVoice % 2 === 0 ? 0 : 1;
            var playingVCO = synth.getPlayingVCO();
            for (var i = 0; i < playingVCO.length; i++) {
                for (var j = startIndex; j < this.numVoice - 1; j += 2) {
                    playingVCO[i].voices[j].voice.detune.value = detune;
                    playingVCO[i].voices[j + 1].voice.detune.value = -detune;
                    detune -= detuneBetweenVoices;
                }
                detune = this.detune;
            }
        }
    }, {
        key: "connect",
        value: function connect(nextNode) {
            console.log(this.filter);
            for (var i = 0; i < this.numVoice; i++) {
                var node = this.voices[i].getNode();
                node.connect(nextNode);
            }
        }
    }, {
        key: "changeVolume",
        value: function changeVolume(oscNum) {
            var newVolume = document.getElementById("volume" + oscNum).value;
            var playingVCO = synth.getPlayingVCO();

            for (var i = 0; i < playingVCO.length; i++) {
                for (var j = 0; j < this.numVoice; j++) {
                    playingVCO[i].voices[j].volume.gain.value = newVolume;
                }
            }
        }
    }, {
        key: "playVCO",
        value: function playVCO() {
            for (var i = 0; i < this.numVoice; i++) {
                this.voices[i].voice.start();
            }
        }
    }, {
        key: "stopVCO",
        value: function stopVCO() {
            for (var i = 0; i < this.numVoice; i++) {
                this.voices[i].voice.stop();
                this.voices[i].voice.disconnect();
                this.voices[i].phaseSlider.disconnect();
                this.voices[i].panner.disconnect();
                this.voices[i].volume.disconnect();
            }
        }
    }]);

    return VoiceContainer;
}();

var Filter = function () {
    function Filter(ctx) {
        _classCallCheck(this, Filter);

        this.filter = ctx.createBiquadFilter();
        this.filter.type = "allpass";
    }

    _createClass(Filter, [{
        key: "connect",
        value: function connect(node) {
            this.filter.connect(node);
        }
    }, {
        key: "getNode",
        value: function getNode() {
            return this.filter;
        }
    }]);

    return Filter;
}();

var Gain = function () {
    function Gain(ctx) {
        _classCallCheck(this, Gain);

        this.gain = ctx.createGain();

        this.gain.gain.value = 0.01;
    }

    _createClass(Gain, [{
        key: "connect",
        value: function connect(node) {
            this.gain.connect(node);
        }
    }, {
        key: "getNode",
        value: function getNode() {
            return this.gain;
        }
    }]);

    return Gain;
}();

var WebSynth = function () {
    // vco1 -> mixer(ADSR) -> filter
    // vco2 ->
    function WebSynth() {
        _classCallCheck(this, WebSynth);

        this.ctx = new AudioContext();
        this.filter = new Filter(this.ctx);
        this.masterGain = new Gain(this.ctx);
        this.filter.connect(this.masterGain.getNode());
        this.masterGain.connect(this.ctx.destination);

        this.playingVCO = [];

        // 左の音を送らせて立体感を出す
        this.splitter = this.ctx.createChannelSplitter(2);
        this.delay = this.ctx.createDelay();
        this.merger = this.ctx.createChannelMerger(2);
        this.delay.delayTime.value = 0.00001;
        this.splitter.connect(this.delay, 0);
        this.delay.connect(this.merger, 0, 0);
        this.splitter.connect(this.merger, 1, 1);
        this.merger.connect(this.filter.getNode());
    }

    _createClass(WebSynth, [{
        key: "getPlayingVCO",
        value: function getPlayingVCO() {
            return this.playingVCO;
        }
    }, {
        key: "playSynth",
        value: function playSynth(freq) {
            this.vco = new VoiceContainer(this.ctx, 1, freq);
            this.playingVCO.push(this.vco);
            this.vco.setDetune(1);
            this.vco.scatterPan(1);
            this.vco.connect(this.splitter);
            this.vco.playVCO();
        }
    }, {
        key: "stopSynth",
        value: function stopSynth(freq) {
            var newPlayingVCO = [];

            for (var i = 0; i < this.playingVCO.length; i++) {
                if (this.playingVCO[i].freq === freq) {
                    this.playingVCO[i].stopVCO();
                } else {
                    newPlayingVCO.push(this.playingVCO[i]);
                }
            }
            this.playingVCO = newPlayingVCO;
        }
    }]);

    return WebSynth;
}();

var synth = new WebSynth();