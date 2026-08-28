import React from 'react';
import { Modal } from './Modal';
import { useAppDispatch, useAppSelector } from '../../store';
import { setSizeGuideOpen } from '../../store/uiSlice';
import { Ruler, Check } from 'lucide-react';

export const SizeGuideModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector((state) => state.ui.isSizeGuideOpen);

  const sizeChart = [
    { size: 'XS', chest: '34 - 36 in (86 - 91 cm)', length: '27 in (68 cm)', fit: 'Slim athletic' },
    { size: 'S', chest: '36 - 38 in (91 - 96 cm)', length: '28 in (71 cm)', fit: 'Regular slim' },
    { size: 'M', chest: '38 - 40 in (96 - 101 cm)', length: '29 in (74 cm)', fit: 'Standard fit' },
    { size: 'L', chest: '40 - 42 in (101 - 106 cm)', length: '30 in (76 cm)', fit: 'Comfort fit' },
    { size: 'XL', chest: '42 - 44 in (106 - 112 cm)', length: '31 in (79 cm)', fit: 'Relaxed fit' },
    { size: 'XXL', chest: '44 - 46 in (112 - 117 cm)', length: '32 in (81 cm)', fit: 'Extended athletic' },
    { size: '3XL', chest: '46 - 48 in (117 - 122 cm)', length: '33 in (84 cm)', fit: 'Maximum comfort' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(setSizeGuideOpen(false))}
      title="OFFICIAL JERSEY SIZING GUIDE"
      subtitle="Find your precise athletic or fan matchday fit"
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="flex items-start gap-3.5 p-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-700">
          <Ruler className="w-5 h-5 text-[#FF5722] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-black font-bold">Player Version vs. Fan Version:</strong> Player issue jerseys feature a high-compression athletic cut. If you prefer a relaxed fit for matchday viewing, we recommend sizing up one size.
          </p>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-2xl">
          <table className="w-full text-left text-xs text-black">
            <thead className="text-[11px] uppercase bg-gray-100 text-black border-b border-gray-200 font-bold">
              <tr>
                <th className="px-4 py-3.5">Size</th>
                <th className="px-4 py-3.5">Chest Circumference</th>
                <th className="px-4 py-3.5">Body Length</th>
                <th className="px-4 py-3.5">Fit Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {sizeChart.map((row) => (
                <tr key={row.size} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-black flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-black text-white text-xs font-bold flex items-center justify-center font-mono">
                      {row.size}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-gray-800">{row.chest}</td>
                  <td className="px-4 py-3 font-mono text-gray-800">{row.length}</td>
                  <td className="px-4 py-3 font-semibold text-gray-600">{row.fit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 bg-green-50 rounded-2xl border border-green-200 text-xs text-green-800 flex items-start gap-2.5">
          <Check className="w-4 h-4 text-green-700 shrink-0 mt-0.5" />
          <span>
            <strong>Easy Size Exchange:</strong> If the jersey fit isn't perfect, we offer 7-day hassle-free size exchanges across all Indian pin codes.
          </span>
        </div>
      </div>
    </Modal>
  );
};
