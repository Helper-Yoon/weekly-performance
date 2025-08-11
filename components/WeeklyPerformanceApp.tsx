import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Calculator, Settings } from 'lucide-react';

interface Item {
  name: string;
  [key: string]: string;
}

interface ItemResult {
  weeklyTarget: number;
  weeklyPerformance: number;
  weekendTarget: number;
  achieved: boolean;
}

interface Results {
  [key: string]: ItemResult;
}

const WeeklyPerformanceApp = () => {
  const days = ['월', '화', '수', '목', '금'];
  const defaultItems = [
    '유심갯수', 'SK인터넷', '프리미엄', '에센스', 'IoT', 
    '1G', 'SK매직', '가전제품', '제휴카드'
  ];
  
  const [items, setItems] = useState<Item[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Results | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const initialItems = defaultItems.map(name => {
      const item: Item = { name };
      days.forEach(day => {
        item[`${day}목표`] = '';
        item[`${day}실적`] = '';
      });
      return item;
    });
    setItems(initialItems);
  }, []);

  // 항목 추가
  const addItem = () => {
    const newName = prompt('새 항목 이름을 입력하세요:');
    if (newName && newName.trim()) {
      const newItem: Item = { name: newName.trim() };
      days.forEach(day => {
        newItem[`${day}목표`] = '';
        newItem[`${day}실적`] = '';
      });
      setItems(prevItems => [...prevItems, newItem]);
    }
  };

  // 항목 삭제
  const removeItem = (itemName: string) => {
    if (window.confirm(`'${itemName}' 항목을 삭제하시겠습니까?`)) {
      setItems(items.filter(item => item.name !== itemName));
    }
  };

  // 값 업데이트
  const updateItem = (itemIndex: number, day: string, type: string, value: string) => {
    const newItems = [...items];
    
    // 월요일 목표 입력 시 다른 요일에도 자동 적용
    if (day === '월' && type === '목표') {
      // 해당 항목의 다른 요일 목표가 비어있으면 월요일 값으로 채우기
      days.forEach(d => {
        if (d === '월') {
          newItems[itemIndex][`${d}${type}`] = value;
        } else if (!newItems[itemIndex][`${d}${type}`] || newItems[itemIndex][`${d}${type}`] === '') {
          newItems[itemIndex][`${d}${type}`] = value;
        }
      });
    } else {
      newItems[itemIndex][`${day}${type}`] = value;
    }
    
    setItems(newItems);
  };

  // 숫자만 입력
  const handleNumberInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    return value === '' || /^\d+$/.test(value) ? value : e.target.value.replace(/[^\d]/g, '');
  };

  // Enter로 아래로 이동
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, dayIndex: number, itemIndex: number, type: 'target' | 'performance') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 다음 요일로 이동
      const nextDayIndex = dayIndex + 1;
      if (nextDayIndex < days.length) {
        const nextInput = document.querySelector(
          `input[data-position="${type}-${nextDayIndex}-${itemIndex}"]`
        ) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.select();
        }
      }
    }
  };

  // 모든 목표 동일하게 설정
  const setUniformTargets = () => {
    const target = prompt('모든 요일의 목표를 입력하세요:');
    if (target && /^\d+$/.test(target)) {
      const newItems = items.map(item => {
        const newItem = { ...item };
        days.forEach(day => {
          newItem[`${day}목표`] = target;
        });
        return newItem;
      });
      setItems(newItems);
    }
  };

  // 특정 요일만 다른 목표 설정
  const setDifferentDayTarget = () => {
    setShowSettings(true);
  };

  // 목표 일괄 적용
  const applyBulkTargets = (defaultTarget: string, specialDay: string, specialTarget: string) => {
    const newItems = items.map(item => {
      const newItem = { ...item };
      days.forEach(day => {
        if (day === specialDay && specialTarget) {
          newItem[`${day}목표`] = specialTarget;
        } else if (defaultTarget) {
          newItem[`${day}목표`] = defaultTarget;
        }
      });
      return newItem;
    });
    setItems(newItems);
    setShowSettings(false);
  };

  // 실적 계산
  const calculatePerformance = () => {
    const itemResults: Results = {};
    
    items.forEach(item => {
      let weeklyTarget = 0;
      let weeklyPerformance = 0;
      
      days.forEach(day => {
        weeklyTarget += parseInt(item[`${day}목표`]) || 0;
        weeklyPerformance += parseInt(item[`${day}실적`]) || 0;
      });
      
      itemResults[item.name] = {
        weeklyTarget,
        weeklyPerformance,
        weekendTarget: weeklyPerformance - weeklyTarget,
        achieved: weeklyPerformance >= weeklyTarget
      };
    });
    
    setResults(itemResults);
    setShowResults(true);
  };

  // 결과 복사
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사되었습니다!');
    });
  };

  // 요약 생성
  const generateSummary = () => {
    if (!results) return { weekday: '', weekend: '' };
    
    const weekdayParts: string[] = [];
    const weekendParts: string[] = [];
    
    Object.entries(results).forEach(([itemName, data]) => {
      const diff = data.weeklyPerformance - data.weeklyTarget;
      weekdayParts.push(`${itemName}: ${diff >= 0 ? '달성' : '미달'} ${diff >= 0 ? '+' : ''}${diff}`);
      weekendParts.push(`${itemName}: 주말${data.weekendTarget >= 0 ? '+' : ''}${data.weekendTarget}`);
    });
    
    return {
      weekday: weekdayParts.join(' / '),
      weekend: weekendParts.join(' / ')
    };
  };

  const summary = generateSummary();

  return (
    <div className="min-h-screen bg-gray-900 py-4 px-2">
      <div className="max-w-full mx-auto" style={{ maxWidth: '1600px' }}>
        <div className="bg-gray-800 rounded-xl shadow-2xl p-4 mb-4 border border-gray-700">
          <h1 className="text-2xl font-bold text-gray-100 mb-2 flex items-center gap-3">
            <Calculator className="text-blue-400" />
            주간 실적 계산기
          </h1>
          <p className="text-sm text-blue-400">Tab키로 옆 항목 이동, Enter키로 아래 요일 이동</p>
        </div>

        {/* 빠른 설정 버튼 */}
        <div className="bg-gray-800 rounded-lg shadow-xl p-3 mb-4 border border-gray-700">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={setUniformTargets}
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
            >
              <Settings size={16} className="inline mr-1" />
              모든 목표 동일 설정
            </button>
            <button
              onClick={setDifferentDayTarget}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
            >
              특정 요일만 다르게
            </button>
            <button
              onClick={addItem}
              className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <Plus size={16} className="inline mr-1" />
              항목 추가
            </button>
          </div>
        </div>

        {/* 설정 모달 */}
        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700">
              <h3 className="text-lg font-bold mb-4 text-gray-100">목표 일괄 설정</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">기본 목표</label>
                  <input
                    type="text"
                    id="defaultTarget"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                    placeholder="모든 요일 기본 목표"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">특별 요일</label>
                  <select id="specialDay" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none">
                    <option value="">선택안함</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}요일</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">특별 요일 목표</label>
                  <input
                    type="text"
                    id="specialTarget"
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:border-blue-500 focus:outline-none"
                    placeholder="특별 요일 목표"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const defaultTarget = (document.getElementById('defaultTarget') as HTMLInputElement).value;
                      const specialDay = (document.getElementById('specialDay') as HTMLSelectElement).value;
                      const specialTarget = (document.getElementById('specialTarget') as HTMLInputElement).value;
                      applyBulkTargets(defaultTarget, specialDay, specialTarget);
                    }}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    적용
                  </button>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex-1 px-4 py-2 bg-gray-600 text-gray-100 rounded-lg hover:bg-gray-700"
                  >
                    취소
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 메인 테이블 - 요일이 세로, 항목이 가로 */}
        <div className="bg-gray-800 rounded-lg shadow-xl overflow-hidden border border-gray-700">
          {/* 목표 섹션 */}
          <div className="border-b border-gray-700">
            <div className="bg-blue-900 px-4 py-2">
              <h3 className="text-sm font-bold text-blue-300">📊 목표 입력</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-750 border-b border-gray-700">
                    <th className="px-4 py-2 text-left font-bold text-gray-300 sticky left-0 bg-gray-750 min-w-[80px]">요일</th>
                    {items.map((item, index) => (
                      <th key={index} className="px-2 py-2 text-center font-bold text-blue-400 min-w-[100px]">
                        {item.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day, dayIndex) => (
                    <tr key={`target-${day}`} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-2 font-medium text-gray-300 sticky left-0 bg-gray-800">
                        {day}요일
                      </td>
                      {items.map((item, itemIndex) => (
                        <td key={`${day}-${item.name}`} className="p-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item[`${day}목표`]}
                            onChange={(e) => {
                              const value = handleNumberInput(e);
                              updateItem(itemIndex, day, '목표', value);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, dayIndex, itemIndex, 'target')}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full px-2 py-1 text-center bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-blue-500 focus:bg-gray-600"
                            placeholder="0"
                            data-position={`target-${dayIndex}-${itemIndex}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 실적 섹션 */}
          <div>
            <div className="bg-green-900 px-4 py-2">
              <h3 className="text-sm font-bold text-green-300">✅ 실적 입력</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-750 border-b border-gray-700">
                    <th className="px-4 py-2 text-left font-bold text-gray-300 sticky left-0 bg-gray-750 min-w-[80px]">요일</th>
                    {items.map((item, index) => (
                      <th key={index} className="px-2 py-2 text-center font-bold text-green-400 min-w-[100px]">
                        <div className="flex items-center justify-center gap-1">
                          <span>{item.name}</span>
                          <button
                            onClick={() => removeItem(item.name)}
                            className="text-red-400 hover:text-red-300 transition-colors p-0.5"
                            tabIndex={-1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day, dayIndex) => (
                    <tr key={`perf-${day}`} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="px-4 py-2 font-medium text-gray-300 sticky left-0 bg-gray-800">
                        {day}요일
                      </td>
                      {items.map((item, itemIndex) => (
                        <td key={`${day}-${item.name}`} className="p-1">
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={item[`${day}실적`]}
                            onChange={(e) => {
                              const value = handleNumberInput(e);
                              updateItem(itemIndex, day, '실적', value);
                            }}
                            onKeyDown={(e) => handleKeyDown(e, dayIndex, itemIndex, 'performance')}
                            onWheel={(e) => e.currentTarget.blur()}
                            className="w-full px-2 py-1 text-center bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:border-green-500 focus:bg-gray-600"
                            placeholder="0"
                            data-position={`performance-${dayIndex}-${itemIndex}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 계산 버튼 */}
        <div className="mt-4">
          <button
            onClick={calculatePerformance}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-bold text-lg shadow-xl"
          >
            <Calculator />
            주간 실적 계산
          </button>
        </div>

        {/* 결과 표시 */}
        {showResults && results && (
          <div className="mt-4 bg-gray-800 rounded-xl shadow-2xl p-6 border border-gray-700">
            <h2 className="text-xl font-bold text-gray-100 mb-4">계산 결과</h2>
            
            <div className="bg-blue-900 bg-opacity-30 rounded-lg p-3 mb-4">
              <p className="text-lg font-semibold text-blue-300">
                전체 {Object.keys(results).length}개 항목 중{' '}
                <span className="text-green-400">{Object.values(results).filter(r => r.achieved).length}개</span> 목표 달성
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {Object.entries(results).map(([itemName, data]) => (
                <div key={itemName} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-750 rounded">
                  <h3 className="font-bold text-gray-100">{itemName}</h3>
                  <div className="text-sm mt-1 text-gray-300">
                    <span>목표: {data.weeklyTarget} / </span>
                    <span>실적: {data.weeklyPerformance} / </span>
                    <span className={`font-bold ${data.achieved ? 'text-green-400' : 'text-red-400'}`}>
                      {data.weeklyPerformance - data.weeklyTarget >= 0 ? '+' : ''}{data.weeklyPerformance - data.weeklyTarget}
                    </span>
                    <span className={`ml-2 font-bold ${data.weekendTarget >= 0 ? 'text-blue-400' : 'text-orange-400'}`}>
                      (주말: {data.weekendTarget >= 0 ? '+' : ''}{data.weekendTarget})
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-750 rounded-lg p-4">
              <h3 className="font-bold text-gray-100 mb-3">복사용 요약</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-1">평일 실적:</p>
                  <div className="bg-gray-700 p-2 rounded border border-gray-600 font-mono text-xs text-gray-100">
                    {summary.weekday}
                  </div>
                  <button
                    onClick={() => copyToClipboard(summary.weekday)}
                    className="mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    <Copy size={14} className="inline mr-1" />
                    복사
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-1">주말 목표:</p>
                  <div className="bg-gray-700 p-2 rounded border border-gray-600 font-mono text-xs text-gray-100">
                    {summary.weekend}
                  </div>
                  <button
                    onClick={() => copyToClipboard(summary.weekend)}
                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    <Copy size={14} className="inline mr-1" />
                    복사
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeeklyPerformanceApp;
