'use client';

import { useState } from 'react';

type ScriptItem = {
    id: number;
    script: string;
    prompt: string;
    type: 'video' | 'image';
    selected: boolean;
};

export default function Page() {
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('professional');
    const [narrator, setNarrator] = useState('Aloy');
    const [format, setFormat] = useState('16:9');
    const [duration, setDuration] = useState('30s');
    const [ctaStyle, setCtaStyle] = useState('soft');
    const [scriptItems, setScriptItems] = useState<ScriptItem[]>([
        {
            id: 1,
            script: 'Welcome to our revolutionary product that will change your life forever.',
            prompt: 'Modern office space with sleek technology, professional lighting',
            type: 'video',
            selected: true,
        },
        {
            id: 2,
            script: 'Experience the difference with our cutting-edge technology.',
            prompt: 'Close-up of hands using futuristic device, clean white background',
            type: 'image',
            selected: true,
        },
        {
            id: 3,
            script: 'Join thousands of satisfied customers today.',
            prompt: 'Happy diverse group of people smiling, bright outdoor setting',
            type: 'video',
            selected: false,
        },
    ]);

    const updateScriptItem = <K extends keyof ScriptItem>(id: number, field: K, value: ScriptItem[K]) => {
        setScriptItems((items) =>
            items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
        );
    };

    return (
        <div className="min-h-screen bg-gray-800 blueprint-grid" data-oid="sn:jvm8">
            {/* Navbar */}
            <nav
                className="bg-black/80 backdrop-blur-sm border-b border-gray-700 px-6 py-4 flex justify-between items-center"
                data-oid=":949wnf"
            >
                <div className="text-white font-bold text-xl" data-oid="8-c1j3u">
                    AdScript AI
                </div>
                <div className="flex items-center space-x-4" data-oid="mpduif4">
                    <button
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        data-oid="wj57jec"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="qydf_l2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                data-oid="-r_4mym"
                            />
                        </svg>
                    </button>
                    <button
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        data-oid="_he_i7v"
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            data-oid="g:s6gku"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                data-oid="6a_tb0."
                            />

                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                data-oid="66kw5p5"
                            />
                        </svg>
                    </button>
                </div>
            </nav>

            <div className="flex h-[calc(100vh-80px)] p-6 gap-6" data-oid="_0-3vjy">
                {/* Left Control Panel */}
                <div
                    className="w-1/3 bg-black/90 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700 h-[841px]"
                    data-oid="5_ab5.k"
                >
                    <h2 className="text-white text-xl font-semibold mb-6" data-oid="inwpe9-">
                        Script Generator
                    </h2>

                    <div className="space-y-6" data-oid="v:51w37">
                        {/* General Prompt */}
                        <div data-oid="v4inihj">
                            <label
                                className="block text-gray-300 text-sm font-medium mb-2"
                                data-oid="6u43poq"
                            >
                                General Prompt
                            </label>
                            <textarea
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows={4}
                                placeholder="Describe your ad concept..."
                                data-oid="t4hqnd2"
                            />
                        </div>

                        {/* Tone and Narrator Voice Row */}
                        <div className="flex space-x-4" data-oid="httpjw3">
                            <div className="flex-1" data-oid="zakf9wn">
                                <label
                                    className="block text-gray-300 text-sm font-medium mb-2"
                                    data-oid="0dtg.sx"
                                >
                                    Tone
                                </label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    data-oid="m46yds3"
                                >
                                    <option value="professional" data-oid="ugqxfo9">
                                        Professional
                                    </option>
                                    <option value="funny" data-oid="wsegq71">
                                        Funny
                                    </option>
                                    <option value="serious" data-oid="i2kdsly">
                                        Serious
                                    </option>
                                    <option value="casual" data-oid="vr:8889">
                                        Casual
                                    </option>
                                    <option value="dramatic" data-oid="3-dwsld">
                                        Dramatic
                                    </option>
                                    <option value="upbeat" data-oid="e480hjc">
                                        Upbeat
                                    </option>
                                </select>
                            </div>

                            <div className="flex-1" data-oid="e4ph900">
                                <label
                                    className="block text-gray-300 text-sm font-medium mb-2"
                                    data-oid="p2xfd.5"
                                >
                                    Narrator Voice
                                </label>
                                <select
                                    value={narrator}
                                    onChange={(e) => setNarrator(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    data-oid="7-perv3"
                                >
                                    <option value="Aloy" data-oid="-xdsib9">
                                        Aloy
                                    </option>
                                    <option value="Chris" data-oid="esgmxv_">
                                        Chris
                                    </option>
                                    <option value="Sarah" data-oid="329eh.o">
                                        Sarah
                                    </option>
                                    <option value="Marcus" data-oid="h-pmmbf">
                                        Marcus
                                    </option>
                                    <option value="Emma" data-oid="5ogdaaf">
                                        Emma
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Time Duration and CTA Style Row */}
                        <div className="flex space-x-4" data-oid="7hdd9jq">
                            <div className="flex-1" data-oid="j-b63zj">
                                <label
                                    className="block text-gray-300 text-sm font-medium mb-2"
                                    data-oid="lr03lk5"
                                >
                                    Time Duration
                                </label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    data-oid="6ddbp-g"
                                >
                                    <option value="10s" data-oid=":y2hgvy">
                                        10s
                                    </option>
                                    <option value="15s" data-oid="c2o8zfl">
                                        15s
                                    </option>
                                    <option value="30s" data-oid="y2lmp12">
                                        30s
                                    </option>
                                    <option value="60s" data-oid="wo9.xi7">
                                        60s
                                    </option>
                                </select>
                            </div>

                            <div className="flex-1" data-oid="5pktiqb">
                                <label
                                    className="block text-gray-300 text-sm font-medium mb-2"
                                    data-oid="kw1igaa"
                                >
                                    CTA Style
                                </label>
                                <select
                                    value={ctaStyle}
                                    onChange={(e) => setCtaStyle(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    data-oid="ok43i03"
                                >
                                    <option value="soft" data-oid="xkckkua">
                                        Soft (learn more)
                                    </option>
                                    <option value="direct" data-oid="h6r78jv">
                                        Direct (buy now)
                                    </option>
                                    <option value="urgent" data-oid="tq4p1xv">
                                        Urgent (limited offer)
                                    </option>
                                    <option value="informational" data-oid="fvo.316">
                                        Informational
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Format Selection */}
                        <div data-oid="2e4ba0y">
                            <label
                                className="block text-gray-300 text-sm font-medium mb-2"
                                data-oid="s3jr5kh"
                            >
                                Format
                            </label>
                            <div className="flex space-x-4" data-oid="jnbw0ny">
                                <button
                                    onClick={() => setFormat('16:9')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                        format === '16:9'
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                    }`}
                                    data-oid=".59ih7v"
                                >
                                    <div
                                        className="w-6 h-4 bg-current rounded-sm opacity-60"
                                        data-oid="esq_xva"
                                    ></div>
                                    <span data-oid="fu-z21w">16:9</span>
                                </button>
                                <button
                                    onClick={() => setFormat('9:16')}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                                        format === '9:16'
                                            ? 'bg-blue-600 border-blue-500 text-white'
                                            : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                    }`}
                                    data-oid="3pi1giu"
                                >
                                    <div
                                        className="w-4 h-6 bg-current rounded-sm opacity-60"
                                        data-oid="8g-tdyd"
                                    ></div>
                                    <span data-oid="g4vy:ni">9:16</span>
                                </button>
                            </div>
                        </div>

                        {/* Generate Script Button */}
                        <button
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            data-oid="qx5-qx1"
                        >
                            Generate Script
                        </button>
                    </div>
                </div>

                {/* Right Output Panel */}
                <div
                    className="flex-1 bg-gray-600/50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-500 relative w-[983px]"
                    data-oid="adq0q6s"
                >
                    <h2
                        className="text-white text-xl font-semibold mb-8 text-center"
                        data-oid="ik41s-8"
                    >
                        Script Timeline
                    </h2>

                    {/* Timeline */}
                    <div className="relative" data-oid="uuqdw6e">
                        {/* Vertical line */}
                        <div
                            className="absolute left-1/2 transform -translate-x-0.5 w-0.5 bg-white/30 h-full"
                            data-oid="o2sp6h3"
                        ></div>

                        <div className="space-y-6" data-oid="z:ev92q">
                            {scriptItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="relative flex items-center"
                                    data-oid="9ofvvzi"
                                >
                                    {/* Timeline point */}
                                    <div
                                        className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full border-4 border-gray-600 z-10"
                                        data-oid="2ru5:cv"
                                    ></div>

                                    {/* Left side - Script */}
                                    <div className="w-[45%] pr-8" data-oid="_4c6a4t">
                                        <textarea
                                            value={item.script}
                                            onChange={(e) =>
                                                updateScriptItem(item.id, 'script', e.target.value)
                                            }
                                            className="w-full bg-gray-700/80 border border-gray-500 rounded-lg px-3 py-2 text-white text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            rows={2}
                                            data-oid="b7:ppa4"
                                        />
                                    </div>

                                    {/* Right side - Visual Prompt */}
                                    <div className="w-[45%] pl-12" data-oid="eb_nnht">
                                        <div
                                            className="bg-gray-700/80 border border-gray-500 rounded-lg p-3"
                                            data-oid="ch93ky."
                                        >
                                            <textarea
                                                value={item.prompt}
                                                onChange={(e) =>
                                                    updateScriptItem(
                                                        item.id,
                                                        'prompt',
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full bg-transparent text-white text-xs resize-none focus:outline-none mb-2"
                                                rows={1}
                                                data-oid="qygv_f3"
                                            />

                                            <div
                                                className="flex items-center justify-between"
                                                data-oid="whb5y5n"
                                            >
                                                <div
                                                    className="flex items-center space-x-2"
                                                    data-oid="pm:s-l."
                                                >
                                                    {/* Image/Video toggle */}
                                                    <button
                                                        onClick={() =>
                                                            updateScriptItem(
                                                                item.id,
                                                                'type',
                                                                'image',
                                                            )
                                                        }
                                                        className={`p-2 rounded ${item.type === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'} transition-colors`}
                                                        data-oid="xala_yd"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                            data-oid="hcx6m:8"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                                clipRule="evenodd"
                                                                data-oid="tcta3yx"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            updateScriptItem(
                                                                item.id,
                                                                'type',
                                                                'video',
                                                            )
                                                        }
                                                        className={`p-2 rounded ${item.type === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'} transition-colors`}
                                                        data-oid="kts976j"
                                                    >
                                                        <svg
                                                            className="w-4 h-4"
                                                            fill="currentColor"
                                                            viewBox="0 0 20 20"
                                                            data-oid="gdb.qwi"
                                                        >
                                                            <path
                                                                d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"
                                                                data-oid="sg-p0wq"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>

                                                {/* Checkbox */}
                                                <label
                                                    className="flex items-center"
                                                    data-oid="ju:z5n_"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={item.selected}
                                                        onChange={(e) =>
                                                            updateScriptItem(
                                                                item.id,
                                                                'selected',
                                                                e.target.checked,
                                                            )
                                                        }
                                                        className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded focus:ring-blue-500 focus:ring-2"
                                                        data-oid="9f.ebmx"
                                                    />

                                                    <span
                                                        className="ml-2 text-sm text-gray-300"
                                                        data-oid="se:a9jt"
                                                    >
                                                        Generate
                                                    </span>
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Generate Button */}
                    <div
                        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
                        data-oid="9alignl"
                    >
                        <button
                            className="bg-gradient-to-r from-blue-800 to-blue-900 hover:from-blue-900 hover:to-blue-950 text-white font-semibold py-4 px-8 rounded-full transition-all duration-200 shadow-2xl hover:shadow-3xl hover:scale-105"
                            data-oid="l:e4:9b"
                        >
                            Generate Assets
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
