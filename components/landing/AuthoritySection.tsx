"use client";

import { GraduationCap, Brain, BookOpen } from "lucide-react";

export function AuthoritySection() {
    return (
        <section className="py-20 bg-gray-50 border-y border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wide mb-6">
                    <Brain className="w-4 h-4" />
                    Ciência, não "Achismo"
                </div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 tracking-tight">
                    Engenharia de Vendas baseada em <span className="text-indigo-600">Neurociência</span>
                </h2>

                <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                    Nossos algoritmos não apenas "escrevem textos". Eles aplicam
                    princípios de persuasão e frameworks validados por décadas de pesquisas
                    nas maiores instituições do mundo.
                </p>

                {/* University Logos Grid (Grayscale/Neutral for Credibility) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 items-center justify-center max-w-4xl mx-auto">

                    {/* Harvard */}
                    <div className="flex flex-col items-center justify-center gap-2 group">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Harvard_University_coat_of_arms.svg/1024px-Harvard_University_coat_of_arms.svg.png"
                            alt="Harvard University"
                            referrerPolicy="no-referrer"
                            className="h-20 md:h-24 w-auto object-contain group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-[#A51C30] transition-colors">Psychology Dept.</span>
                    </div>

                    {/* Stanford */}
                    <div className="flex flex-col items-center justify-center gap-2 group">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Seal_of_Leland_Stanford_Junior_University.svg/1024px-Seal_of_Leland_Stanford_Junior_University.svg.png"
                            alt="Stanford University"
                            referrerPolicy="no-referrer"
                            className="h-20 md:h-24 w-auto object-contain group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-[#8C1515] transition-colors">Persuasive Tech Lab</span>
                    </div>

                    {/* Yale */}
                    <div className="flex flex-col items-center justify-center gap-2 group">
                        <img
                            src="/yale.png"
                            alt="Yale University"
                            className="h-20 md:h-24 w-auto object-contain group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-[#00356b] transition-colors">Consumer Psychology</span>
                    </div>

                    {/* Wharton / UPenn (Marketing) OR MIT */}
                    <div className="flex flex-col items-center justify-center gap-2 group">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/MIT_logo.svg/2560px-MIT_logo.svg.png"
                            alt="MIT"
                            referrerPolicy="no-referrer"
                            className="h-10 md:h-12 w-auto object-contain mt-4 md:mt-6 mb-2 group-hover:scale-110 transition-transform"
                        />
                        <span className="text-sm font-semibold text-gray-400 group-hover:text-black transition-colors mt-2">Sloan School</span>
                    </div>

                </div>

                <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                            <Brain className="w-5 h-5 text-gray-700" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Vieses Cognitivos</h3>
                        <p className="text-sm text-gray-600">
                            Utilizamos gatilhos como <strong>Aversão à Perda</strong> e <strong>Prova Social</strong>,
                            exaustivamente estudados por Daniel Kahneman (Nobel de Economia).
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                            <BookOpen className="w-5 h-5 text-gray-700" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Engenharia de Prompt</h3>
                        <p className="text-sm text-gray-600">
                            Scripts estruturados em modelos como <strong>AIDA</strong> e <strong>PAS</strong>,
                            padrões ouro do copywriting direto validados pelo mercado.
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                            <GraduationCap className="w-5 h-5 text-gray-700" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">Influência Cialdini</h3>
                        <p className="text-sm text-gray-600">
                            Baseado nos 6 Princípios da Influência do Dr. Robert Cialdini:
                            Reciprocidade, Compromisso, Autoridade, e mais.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
