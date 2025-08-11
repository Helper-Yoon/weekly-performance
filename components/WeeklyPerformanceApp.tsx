import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Copy, Calculator, Calendar, Settings, ChevronDown, ChevronUp } from 'lucide-react';

const WeeklyPerformanceApp = () => {
  const [days] = useState(['월', '화', '수', '목', '금']);
  const [dailyData, setDailyData] = useState({});
  const [expandedDays, setExpandedDays] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(null);

  // 초기 데이터 설정
  useEffect(() => {
    const initialData = {};
    const initialExpanded = {};
    days.forEach(day => {
      initialData[day] = {
        items: [
          { name: '유심갯수', target: '', performance: '' },
          { name: 'SK인터넷', target: '', performance: '' },
          { name: '프리미엄', target: '', performance: '' },
          { name: '에센스', target: '', performance: '' },
          { name: 'IoT', target: '', performance: '' },
          { name: '1G', target: '', performance: '' },
          { name: 'SK매직', target: '', performance: '' },
          { name: '가전제품', target: '', performance: '' },
          { name: '제휴카드', target: '', performance: '' },
        ]
      };
      initialExpanded[day] = true;
    });
    setDailyData(initialData);
    setExpandedDays(initialExpanded);
  }, [days]);

  // 항목 추가
  const addItem = (day) => {
    const newName = prompt('새 항목 이름을 입력하세요:');
    if (newName && newName.trim()) {
      setDailyData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          items: [...prev[day].items, { name: newName.trim(), target: '', performance: '' }]
        }
      }));
    }
  };

  // 항목 삭제
  const removeItem = (day, index) => {
    if (window.confirm('이 항목을 삭제하시겠습니까?')) {
      setDailyData(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          items: prev[day].items.filter((_, i) => i !== index)
        }
      }));
    }
  };

  // 입력값 변경
  const updateItem = (day, index, field, value) => {
    setDailyData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        items: prev[day].items.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  // 다른 요일에 같은 항목 복사
  const copyItemsToDay = (fromDay, toDay) => {
    if (window.confirm(`${fromDay}요일의 항목을 ${toDay}요일에 복사하시겠습니까?`)) {
      setDailyData(prev => ({
        ...prev,
        [toDay]: {
          ...prev[toDay],
          items: prev[fromDay].items.map(item => ({
            ...item,
            target: '',
            performance: ''
          }))
        }
      }));
    }
  };

  // 모든 요일에 같은 항목 설정
  const applyItemsToAllDays = (sourceDay) => {
    if (window.confirm(`${sourceDay}요일의 항목을 모든 요일에 적용하시겠습니까?`)) {
      const sourceItems = dailyData[sourceDay].items;
      const newData = {};
      days.forEach(day => {
        newData[day] = {
          items: sourceItems.map(item => ({
            name: item.name,
            target: day === sourceDay ? item.target : '',
            performance: day === sourceDay ? item.performance : ''
          }))
        };
      });
      setDailyData(newData);
    }
  };

  // 요일 접기/펼치기
  const toggleDay = (day) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day]
    }));
  };

  // 실적 계산
  const calculatePerformance = () => {
    const itemResults = {};
    
    // 모든 항목 수집
    Object.entries(dailyData).forEach(([day, dayData]) => {
      dayData.items.forEach(item => {
        if (!itemResults[item.name]) {
          itemResults[item.name] = {
            targets: {},
            performances: {},
            weeklyTarget: 0,
            weeklyPerformance: 0
          };
        }
        
        const target = parseInt(item.target) || 0;
        const performance = parseInt(item.performance) || 0;
        
        itemResults[item.name].targets[day] = target;
        itemResults[item.name].performances[day] = performance;
        itemResults[item.name].weeklyTarget += target;
        itemResults[item.name].weeklyPerformance += performance;
      });
    });

    // 주말 목표 계산
    Object.keys(itemResults).forEach(itemName => {
      const item = itemResults[itemName];
      item.weekendTarget = item.weeklyPerformance - item.weeklyTarget;
      item.achieved = item.weeklyPerformance >= item.weeklyTarget;
    });

    setResults(itemResults);
    setShowResults(true);
  };

  // 결과 복사
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('클립보드에 복사되었습니다!');
    });
  };

  // 결과 요약 생성
  const generateSummary = () => {
    if (!results) return { weekday: '', weekend: '' };
    
    const weekdayParts = [];
    const weekendParts = [];
    
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Calculator className="text-blue-600" />
            주간 실적 계산기
          </h1>
          <p className="text-gray-600">매일 다른 항목과 목표를 설정할 수 있습니다</p>
        </div>

        {/* 요일별 입력 섹션 */}
        <div className="space-y-4 mb-6">
          {days.map(day => (
            <div key={day} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 flex justify-between items-center cursor-pointer hover:from-blue-600 hover:to-blue-700 transition-colors"
                onClick={() => toggleDay(day)}
              >
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar size={20} />
                  {day}요일
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
                    {dailyData[day]?.items.length || 0}개 항목
                  </span>
                  {expandedDays[day] ? <ChevronUp /> : <ChevronDown />}
                </div>
              </div>

              {expandedDays[day] && (
                <div className="p-4">
                  {/* 빠른 작업 버튼 */}
                  <div className="flex gap-2 mb-4 flex-wrap">
                    <button
                      onClick={() => addItem(day)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      <Plus size={16} />
                      항목 추가
                    </button>
                    <button
                      onClick={() => applyItemsToAllDays(day)}
                      className="px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                    >
                      모든 요일에 적용
                    </button>
                    {days.filter(d => d !== day).map(targetDay => (
                      <button
                        key={targetDay}
                        onClick={() => copyItemsToDay(day, targetDay)}
                        className="px-3 py-1.5 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                      >
                        {targetDay}요일에 복사
                      </button>
                    ))}
                  </div>

                  {/* 항목 테이블 */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2 px-3 font-semibold text-gray-700">항목</th>
                          <th className="text-center py-2 px-3 font-semibold text-blue-600">목표</th>
                          <th className="text-center py-2 px-3 font-semibold text-green-600">실적</th>
                          <th className="text-center py-2 px-3 w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyData[day]?.items.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                value={item.name}
                                onChange={(e) => updateItem(day, index, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="항목명"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={item.target}
                                onChange={(e) => updateItem(day, index, 'target', e.target.value)}
                                className="w-full px-2 py-1 border border-blue-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-400"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                value={item.performance}
                                onChange={(e) => updateItem(day, index, 'performance', e.target.value)}
                                className="w-full px-2 py-1 border border-green-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-green-400"
                                placeholder="0"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <button
                                onClick={() => removeItem(day, index)}
                                className="text-red-500 hover:text-red-700 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 계산 버튼 */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={calculatePerformance}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 font-bold text-lg shadow-lg"
          >
            <Calculator />
            주간 실적 계산
          </button>
        </div>

        {/* 결과 표시 */}
        {showResults && results && (
          <div className="bg-white rounded-xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 계산 결과</h2>
            
            {/* 전체 요약 */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <p className="text-lg font-semibold text-blue-800">
                전체 {Object.keys(results).length}개 항목 중{' '}
                {Object.values(results).filter(r => r.achieved).length}개 목표 달성
              </p>
            </div>

            {/* 항목별 결과 */}
            <div className="space-y-4 mb-6">
              {Object.entries(results).map(([itemName, data]) => (
                <div key={itemName} className="border-l-4 border-blue-500 pl-4 py-2">
                  <h3 className="font-bold text-lg text-gray-800">{itemName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-gray-600">주간 목표:</span>{' '}
                      <span className="font-semibold">{data.weeklyTarget}개</span>
                    </div>
                    <div>
                      <span className="text-gray-600">주간 실적:</span>{' '}
                      <span className="font-semibold">{data.weeklyPerformance}개</span>
                    </div>
                    <div>
                      <span className="text-gray-600">차이:</span>{' '}
                      <span className={`font-semibold ${data.achieved ? 'text-green-600' : 'text-red-600'}`}>
                        {data.weeklyPerformance - data.weeklyTarget >= 0 ? '+' : ''}
                        {data.weeklyPerformance - data.weeklyTarget}개
                      </span>
                    </div>
                  </div>
                  <div className="mt-2">
                    <span className="text-gray-600">주말 목표:</span>{' '}
                    <span className={`font-bold ${data.weekendTarget >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                      {data.weekendTarget >= 0 ? '+' : ''}{data.weekendTarget}개
                      {data.weekendTarget > 0 && ' (추가 여유)'}
                      {data.weekendTarget < 0 && ' (보충 필요)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 복사용 요약 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-3">📋 복사용 요약</h3>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">평일 실적:</p>
                  <div className="bg-white p-2 rounded border border-gray-200 font-mono text-sm">
                    {summary.weekday}
                  </div>
                  <button
                    onClick={() => copyToClipboard(summary.weekday)}
                    className="mt-2 flex items-center gap-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    <Copy size={14} />
                    복사
                  </button>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-600 mb-1">주말 목표:</p>
                  <div className="bg-white p-2 rounded border border-gray-200 font-mono text-sm">
                    {summary.weekend}
                  </div>
                  <button
                    onClick={() => copyToClipboard(summary.weekend)}
                    className="mt-2 flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                  >
                    <Copy size={14} />
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
