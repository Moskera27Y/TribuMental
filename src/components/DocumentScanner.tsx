/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { MedicalDocument, Appointment } from "../types";
import { 
  FileText, 
  Camera, 
  Sparkles, 
  Paperclip, 
  Plus, 
  Search,
  Eye,
  CheckCircle,
  FileSpreadsheet,
  AlertCircle
} from "lucide-react";

interface DocumentScannerProps {
  documents: MedicalDocument[];
  appointments: Appointment[];
  onAddDocument: (doc: any) => Promise<any>;
  onDeleteDocument: (id: string) => Promise<any>;
  onAnalyzeDocument: (fileName: string, fileType: string, fileDataUrl: string) => Promise<any>;
  onLinkDocument: (docId: string, apptId: string | undefined) => Promise<any>;
  viewOwnerId: string | null;
}

export default function DocumentScanner({
  documents,
  appointments,
  onAddDocument,
  onDeleteDocument,
  onAnalyzeDocument,
  onLinkDocument,
  viewOwnerId
}: DocumentScannerProps) {
  const [tagFilter, setTagFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState<any | null>(null);
  
  // Custom interactive mock capture state
  const [selectedPresetFile, setSelectedPresetFile] = useState<string | null>(null);
  const [selectedApptId, setSelectedApptId] = useState<string>("");
  
  // View file modal
  const [viewingDoc, setViewingDoc] = useState<MedicalDocument | null>(null);

  // Ready-to-scan dummy base64 contents matching common pregnancy documents
  const PRESET_FILES = [
    {
      id: "preset-analitica",
      name: "analitica_segundo_trimestre.png",
      type: "Laboratorio",
      label: "🧪 Receta de Analítica Glucosa (O'Sullivan)",
      desc: "Simula subir un examen de glucosa en ayunas."
    },
    {
      id: "preset-ecografia",
      name: "ecografia_fetal_24_semanas.png",
      type: "Ecografía",
      label: "🤰 Ecografía Prenatal 24 Semanas",
      desc: "Simula un ultrasonido obstétrico morfométrico."
    },
    {
      id: "preset-pediatria",
      name: "control_pediatrico_1er_mes.png",
      type: "Pediatría",
      label: "👶 Carnet Pediátrico Mateo",
      desc: "Simula el alta física o peso/vacunas de un bebé."
    }
  ];

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetFile(presetId);
    setScannedResult(null);
  };

  const handleScanAction = async () => {
    if (!selectedPresetFile) return;
    
    setScanning(true);
    setScannedResult(null);

    try {
      const preset = PRESET_FILES.find(p => p.id === selectedPresetFile)!;
      // We send a tiny valid placeholder PNG base64 representation to prompt Gemini
      const dummyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
      const dataUrl = `data:image/png;base64,${dummyPngBase64}`;

      console.log(`Analyzing preset: ${preset.name} using full-stack OCR...`);
      // Contact our server-side Gemini OCR engine
      const analyzed = await onAnalyzeDocument(preset.name, preset.type, dataUrl);
      setScannedResult({
        name: preset.name,
        type: preset.type,
        ocrText: analyzed.ocrText,
        extractedMetadata: analyzed.extractedMetadata
      });
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  };

  const handleSaveDocument = async () => {
    if (!scannedResult) return;

    try {
      await onAddDocument({
        name: scannedResult.name,
        type: scannedResult.type,
        fileDataUrl: "/assets/sample_document.png", // simulated cloud storage URL
        ocrText: scannedResult.ocrText,
        extractedMetadata: scannedResult.extractedMetadata,
        appointmentId: selectedApptId || undefined,
        size: "1.4 MB"
      });

      // Clear scanning workbench
      setScannedResult(null);
      setSelectedPresetFile(null);
      setSelectedApptId("");
    } catch (err) {
      console.error(err);
    }
  };

  // Filter listings
  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (d.ocrText && d.ocrText.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (d.extractedMetadata?.doctorName && d.extractedMetadata.doctorName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (tagFilter === "ALL") return matchesSearch;
    return d.type === tagFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-serif text-[#2F3E46] font-medium">Bóveda de Expedientes Médicos</h3>
        <p className="text-xs text-[#7A7875] mt-1">Sube y categoriza digitalmente tus recetas, órdenes y ecografías con análisis automático de IA 🌸</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LAUNCHER CAMERA & OCR WORKBENCH (cols 5) */}
        <div className="lg:col-span-5 space-y-6">
          {viewOwnerId ? (
            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 text-center space-y-4 shadow-sm">
              <div className="w-12 h-12 bg-[#8C9B73]/10 text-[#5A634D] rounded-full flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6 text-[#8C9B73]" />
              </div>
              <h4 className="font-serif font-semibold text-md text-[#2F3E46]">Escáner de IA Desactivado</h4>
              <p className="text-xs text-[#7A7875] max-w-sm mx-auto leading-relaxed">
                Como compañero de apoyo de TribuMental, tienes acceso de solo lectura de consentimiento. No puedes subir, escanear o vincular recetas y expedientes médicos en TribuMental.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm">
              <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest mb-4 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-[#8C9B73]" />
                Escáner de Cámara Inteligente
              </h4>

              {/* Custom Interactive Camera Box */}
              <div className="relative aspect-video rounded-3xl bg-[#2F3E46] border-2 border-dashed border-[#8C9B73]/40 overflow-hidden flex flex-col items-center justify-center p-4">
                {scanning ? (
                  <>
                    {/* Sweeping Laser Beam Animation */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#8C9B73] opacity-80 shadow-md animate-laser"></div>
                    <div className="absolute inset-0 bg-[#8C9B73]/10 animate-pulse"></div>
                    <div className="text-center z-10 text-white space-y-2">
                      <Sparkles className="w-10 h-10 text-[#8C9B73] mx-auto animate-spin" />
                      <p className="text-xs font-mono font-bold tracking-widest text-[#F4F1ED]">GEMINI AI OCR EN ACCIÓN</p>
                      <p className="text-[10px] text-[#A3A19E]">Extrayendo diagnósticos, fechas y médicos...</p>
                    </div>
                  </>
                ) : selectedPresetFile ? (
                  <div className="text-center text-white p-4 space-y-2 z-10">
                    <FileText className="w-12 h-12 text-[#8C9B73] mx-auto" />
                    <p className="text-xs font-bold font-serif text-[#F4F1ED]">{PRESET_FILES.find(p => p.id === selectedPresetFile)?.name}</p>
                    <p className="text-[10px] text-[#A3A19E]">Listo para ser escasamente analizado por el motor AI.</p>
                  </div>
                ) : (
                  <div className="text-center text-[#A3A19E] p-4 space-y-2">
                    <Camera className="w-10 h-10 mx-auto text-[#8C9B73]" />
                    <p className="text-xs font-semibold text-[#F4F1ED]">Cámara lista</p>
                    <p className="text-[10px] text-[#A3A19E]">Selecciona un documento muestra abajo para simular captura de cámara móvil.</p>
                  </div>
                )}

                {/* Laser css styles helper */}
                <style>{`
                  @keyframes laser {
                    0% { top: 0%; }
                    50% { top: 100%; }
                    100% { top: 0%; }
                  }
                  .animate-laser {
                    animation: laser 2.2s infinite ease-in-out;
                  }
                `}</style>
              </div>

              {/* Step 1: Select dummy prescription button triggers */}
              <div className="mt-4 space-y-2.5">
                <label className="block text-[10px] font-bold text-[#A3A19E] uppercase">1. Elige un documento de tu folder físico:</label>
                <div className="space-y-2">
                  {PRESET_FILES.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectPreset(p.id)}
                      className={`w-full p-3 rounded-2xl border text-left text-xs flex flex-col justify-between transition-all cursor-pointer ${
                        selectedPresetFile === p.id 
                          ? "border-[#8C9B73] bg-[#FBF9F4] shadow-sm ring-1 ring-[#8C9B73]/40" 
                          : "border-[#ECE8E0] hover:bg-[#F4F1ED] bg-white text-[#2F3E46]"
                      }`}
                    >
                      <span className="font-semibold text-[#2F3E46]">{p.label}</span>
                      <span className="text-[10px] text-[#7A7875] mt-0.5">{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Trigger Scan */}
              <button
                onClick={handleScanAction}
                disabled={!selectedPresetFile || scanning}
                className={`w-full mt-4 py-3 bg-[#8C9B73] hover:bg-[#7d8c66] text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  !selectedPresetFile ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>{scanning ? "Sincronizando con Gemini..." : "Escanear Documento con IA"}</span>
              </button>
            </div>
          )}

          {/* OCR RESULTS WORKBENCH BLOCK */}
          {!viewOwnerId && scannedResult && (
            <div className="bg-[#FBF9F4] rounded-[40px] border border-[#ECE8E0] p-5 shadow-sm space-y-4 animate-fadeIn text-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-[#5A634D] uppercase tracking-wider">
                <CheckCircle className="w-4.5 h-4.5 text-[#8C9B73] shrink-0" />
                <span>Resultados de Análisis OCR de la IA</span>
              </div>

              {/* Extracted Metadata Card */}
              <div className="p-3.5 bg-white border border-[#ECE8E0] rounded-2xl text-xs space-y-2">
                <div className="flex justify-between border-b border-[#ECE8E0] pb-1.5 font-semibold text-[#2F3E46]">
                  <span>Médico / Emisor:</span>
                  <span className="text-[#5A634D]">{scannedResult.extractedMetadata?.doctorName || "Detectando..."}</span>
                </div>
                <div className="flex justify-between border-b border-[#ECE8E0] pb-1.5 font-semibold text-[#2F3E46]">
                  <span>Fecha de Emisión:</span>
                  <span className="text-[#8C9B73] font-mono">{scannedResult.extractedMetadata?.dateOfDocument || "Detectando..."}</span>
                </div>
                <div className="flex justify-between border-b border-[#ECE8E0] pb-1.5 font-semibold text-[#2F3E46]">
                  <span>Paciente:</span>
                  <span className="text-[#7A7875]">{scannedResult.extractedMetadata?.patientName || "Detectando..."}</span>
                </div>
                <div className="pt-1.5">
                  <span className="font-semibold block text-[#8B5E5E]">Resumen de Diagnóstico / Indicaciones:</span>
                  <p className="text-[11px] text-[#7A7875] mt-1 leading-relaxed italic">
                    "{scannedResult.extractedMetadata?.keyFindings}"
                  </p>
                </div>
              </div>

              {/* Link metadata to calendar schedule option */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-[#A3A19E] uppercase">2. Adjuntar a Cita Existente:</label>
                <select
                  value={selectedApptId}
                  onChange={e => setSelectedApptId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#ECE8E0] text-[#2F3E46] cursor-pointer focus:outline-none"
                >
                  <option value="">-- No adjuntar, guardar libremente --</option>
                  {appointments.map(a => (
                    <option key={a.id} value={a.id}>
                      [{a.date}] {a.title} ({a.doctor})
                    </option>
                  ))}
                </select>
                <p className="text-[9px] text-[#A3A19E]">Si lo asocias, este archivo aparecerá en tu agenda bajo esa fecha.</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setScannedResult(null)}
                  className="flex-1 py-2 rounded-xl text-xs font-semibold border border-[#ECE8E0] hover:bg-[#F4F1ED] bg-white text-[#5A634D]"
                >
                  Descartar
                </button>
                <button
                  type="button"
                  onClick={handleSaveDocument}
                  className="flex-1 py-2 bg-[#8C9B73] hover:bg-[#7d8c66] text-white text-xs font-bold rounded-xl"
                >
                  Archivar en Expediente 📂
                </button>
              </div>
            </div>
          )}
        </div>

        {/* VAULT DIRECTORY SEARCH & LISTINGS (cols 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 shadow-sm space-y-4">
            {/* Header Search Inputs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
              <h4 className="text-xs font-bold text-[#A3A19E] uppercase tracking-widest flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-[#8C9B73]" />
                Directorio de Expedientes ({filteredDocs.length})
              </h4>

              {/* Categories filters */}
              <div className="flex gap-1">
                {["ALL", "Laboratorio", "Ecografía", "Pediatría"].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setTagFilter(tag)}
                    className={`text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${
                      tagFilter === tag ? "bg-[#8C9B73] text-white" : "bg-[#F4F1ED] text-[#7A7875] hover:bg-[#eae6e0]"
                    }`}
                  >
                    {tag === "ALL" ? "Todos" : tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A3A19E]" />
              <input
                type="text"
                placeholder="Busca por médico, tratamiento, hallazgo u OCR..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#ECE8E0] text-xs focus:ring-1 focus:ring-[#8C9B73] focus:border-[#8C9B73] focus:outline-none bg-[#FBF9F4] text-[#2F3E46]"
              />
            </div>

            {/* Listing Grid */}
            {filteredDocs.length === 0 ? (
              <div className="text-center py-16 text-xs text-[#A3A19E]">
                Ningún documento coincide con la búsqueda o filtros.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredDocs.map((doc) => {
                  const linkedAppointment = appointments.find(a => a.id === doc.appointmentId);
                  return (
                    <div 
                      key={doc.id}
                      className="p-4 border border-[#ECE8E0] rounded-3xl bg-white hover:bg-[#FBF9F4] transition-colors flex flex-col justify-between gap-3 relative"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[8px] font-extrabold uppercase bg-[#F4F1ED] border border-[#ECE8E0] px-1.5 py-0.5 rounded text-[#5A634D]">
                            {doc.type}
                          </span>
                          <span className="text-[8px] font-mono text-[#A3A19E]">{doc.size || "1.0 MB"}</span>
                        </div>

                        <h5 className="text-xs font-semibold text-[#2F3E46] truncate" title={doc.name}>
                          {doc.name}
                        </h5>

                        {/* Extractions metadata summary review */}
                        {doc.extractedMetadata && (
                          <div className="text-[10px] text-[#7A7875] space-y-1 pr-6">
                            <p className="line-clamp-1"><strong className="text-[#5A634D]">Dr: </strong>{doc.extractedMetadata.doctorName}</p>
                            <p className="line-clamp-2 italic text-[#A3A19E] font-light mt-0.5">"{doc.extractedMetadata.keyFindings}"</p>
                          </div>
                        )}

                        {linkedAppointment && (
                          <div className="text-[9px] bg-[#FBF9F4] border border-[#8C9B73]/20 text-[#5A634D] p-1.5 rounded-lg flex items-center gap-1">
                            <Plus className="w-3 h-3 shrink-0" />
                            <span className="truncate">Cita: {linkedAppointment.title}</span>
                          </div>
                        )}
                      </div>

                      {/* Control buttons */}
                      <div className="flex items-center justify-between border-t border-[#ECE8E0] pt-2.5 mt-1">
                        <button
                          type="button"
                          onClick={() => setViewingDoc(doc)}
                          className="text-[9px] font-bold text-[#8C9B73] flex items-center gap-1 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Ver Transcrito OCR</span>
                        </button>

                        {!viewOwnerId && (
                          <button
                            type="button"
                            onClick={() => onDeleteDocument(doc.id)}
                            className="text-[9px] font-medium text-rose-500 hover:bg-rose-50 p-1 px-1.5 rounded cursor-pointer"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Viewing full OCR text modal dialogue */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-[#2F3E46]/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[40px] border border-[#ECE8E0] p-6 max-w-lg w-full space-y-4 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-md font-serif font-semibold text-[#2F3E46]">{viewingDoc.name}</h4>
                <span className="text-[9px] font-extrabold uppercase text-[#5A634D] bg-[#F4F1ED] border border-[#ECE8E0] px-2 py-0.5 rounded-xl">
                  {viewingDoc.type}
                </span>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="text-[#A3A19E] hover:text-[#5A634D] font-bold p-1 hover:bg-[#FBF9F4] rounded-lg cursor-pointer text-xs"
              >
                Cerrar
              </button>
            </div>

            <div className="p-4 bg-[#2F3E46] text-[#F4F1ED] rounded-3xl overflow-y-auto max-h-72 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">
              {viewingDoc.ocrText || "Ningún texto decodificado todavía."}
            </div>

            {viewingDoc.extractedMetadata && (
              <div className="p-4 bg-[#FBF9F4] border border-[#ECE8E0] rounded-3xl space-y-2 text-xs">
                <p className="font-semibold text-[#5A634D]">Resumen Sanitario de la IA:</p>
                <p className="text-[#7A7875] line-clamp-4 italic">"{viewingDoc.extractedMetadata.keyFindings}"</p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#A3A19E] pt-1.5 border-t border-[#ECE8E0]">
                  <p>Médico: {viewingDoc.extractedMetadata.doctorName}</p>
                  <p>Fecha: {viewingDoc.extractedMetadata.dateOfDocument}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
