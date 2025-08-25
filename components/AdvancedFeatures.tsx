'use client';

import React, { useState, useEffect } from 'react';
import { FiZap, FiBarChart, FiTrendingUp, FiShield, FiCode, FiTarget, FiActivity, FiAward } from 'react-icons/fi';
import { BsLightningCharge, BsGear, BsGraphUp, BsEye } from 'react-icons/bs';

interface FeatureCardProps {
	icon: React.ReactNode;
	title: string;
	description: string;
	status: 'active' | 'inactive' | 'loading';
	onClick?: () => void;
	stats?: {
		label: string;
		value: string | number;
		trend?: 'up' | 'down' | 'neutral';
	}[];
}

const FeatureCard: React.FC<FeatureCardProps> = ({ 
	icon, 
	title, 
	description, 
	status, 
	onClick, 
	stats 
}) => {
	const getStatusColor = () => {
		switch (status) {
			case 'active': return 'border-green-500 bg-green-500/10';
			case 'loading': return 'border-yellow-500 bg-yellow-500/10';
			case 'inactive': return 'border-gray-500 bg-gray-500/10';
			default: return 'border-gray-500 bg-gray-500/10';
		}
	};

	const getStatusText = () => {
		switch (status) {
			case 'active': return 'Active';
			case 'loading': return 'Loading...';
			case 'inactive': return 'Inactive';
			default: return 'Unknown';
		}
	};

	return (
		<div 
			className={`p-6 rounded-lg border-2 ${getStatusColor()} hover:scale-105 transition-all duration-300 cursor-pointer`}
			onClick={onClick}
		>
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="text-2xl text-blue-400">
						{icon}
					</div>
					<h3 className="text-lg font-semibold text-white">{title}</h3>
				</div>
				<span className={`px-2 py-1 rounded-full text-xs font-medium ${
					status === 'active' ? 'bg-green-500/20 text-green-400' :
					status === 'loading' ? 'bg-yellow-500/20 text-yellow-400' :
					'bg-gray-500/20 text-gray-400'
				}`}>
					{getStatusText()}
				</span>
			</div>
			
			<p className="text-gray-300 text-sm mb-4">{description}</p>
			
			{stats && (
				<div className="grid grid-cols-2 gap-2">
					{stats.map((stat, index) => (
						<div key={index} className="text-center">
							<div className="text-lg font-bold text-white">{stat.value}</div>
							<div className="text-xs text-gray-400">{stat.label}</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

const PredictionDemo: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const [code, setCode] = useState(`function calculateSum(a, b) {
  // TODO: Implement sum calculation
  return 
}`);

	const [predictions, setPredictions] = useState<string[]>([]);
	const [isAnalyzing, setIsAnalyzing] = useState(false);

	const analyzeCode = async () => {
		setIsAnalyzing(true);
		// Simulate AI analysis
		setTimeout(() => {
			const suggestions = [
				'return a + b;',
				'return a + b; // Add the two numbers',
				'const result = a + b;\n  return result;',
				'if (typeof a === "number" && typeof b === "number") {\n    return a + b;\n  }\n  throw new Error("Invalid input");'
			];
			setPredictions(suggestions);
			setIsAnalyzing(false);
		}, 2000);
	};

	useEffect(() => {
		analyzeCode();
	}, []);

	return (
		<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
			<div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
				<div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
					<h2 className="text-2xl font-bold text-white flex items-center gap-2">
						<BsLightningCharge className="text-blue-400" />
						AI Code Prediction Demo
					</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<div>
							<h3 className="text-lg font-semibold text-white mb-3">Input Code</h3>
							<textarea
								value={code}
								onChange={(e) => setCode(e.target.value)}
								className="w-full h-64 bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3 text-white font-mono text-sm resize-none"
								placeholder="Enter your code here..."
							/>
							<button
								onClick={analyzeCode}
								disabled={isAnalyzing}
								className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
							>
								{isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
							</button>
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white mb-3">AI Predictions</h3>
							{isAnalyzing ? (
								<div className="flex items-center gap-2 text-blue-400">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
									Analyzing code patterns...
								</div>
							) : (
								<div className="space-y-3">
									{predictions.map((prediction, index) => (
										<div key={index} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3">
											<div className="flex items-center justify-between mb-2">
												<span className="text-sm text-gray-400">Suggestion {index + 1}</span>
												<span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
												95% confidence
												</span>
											</div>
											<pre className="text-sm text-white font-mono bg-[#0a0a0a] p-2 rounded">
												{prediction}
											</pre>
											<button className="mt-2 text-xs text-blue-400 hover:text-blue-300">
												Apply suggestion
											</button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const DebuggingDemo: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const [issues, setIssues] = useState<any[]>([]);
	const [selectedIssue, setSelectedIssue] = useState<any>(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);

	const sampleCode = `function processData(data) {
  let result = 0;
  for (let i = 0; i < data.length; i++) {
    result += data[i];
  }
  return result / data.length;
}

function main() {
  const numbers = [1, 2, 3, 4, 5];
  const average = processData(numbers);
  console.log("Average:", average);
  
  // Potential issue: division by zero
  const emptyArray = [];
  const emptyAverage = processData(emptyArray);
  console.log("Empty average:", emptyAverage);
}`;

	const analyzeCode = async () => {
		setIsAnalyzing(true);
		// Simulate AI debugging analysis
		setTimeout(() => {
			const detectedIssues = [
				{
					id: 1,
					type: 'error',
					severity: 'high',
					message: 'Potential division by zero',
					line: 5,
					description: 'The function may divide by zero when data array is empty',
					suggestion: 'Add a check for empty array before division',
					fix: 'if (data.length === 0) return 0;'
				},
				{
					id: 2,
					type: 'warning',
					severity: 'medium',
					message: 'Unused variable',
					line: 12,
					description: 'Variable "emptyAverage" is calculated but never used',
					suggestion: 'Remove unused variable or use it',
					fix: '// Remove this line or use the variable'
				},
				{
					id: 3,
					type: 'info',
					severity: 'low',
					message: 'Consider using reduce()',
					line: 2,
					description: 'Traditional for loop could be replaced with array.reduce()',
					suggestion: 'Use modern array methods for better readability',
					fix: 'return data.reduce((sum, num) => sum + num, 0) / data.length;'
				}
			];
			setIssues(detectedIssues);
			setSelectedIssue(detectedIssues[0]);
			setIsAnalyzing(false);
		}, 2000);
	};

	useEffect(() => {
		analyzeCode();
	}, []);

	return (
		<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
			<div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg w-full max-w-7xl max-h-[90vh] overflow-y-auto">
				<div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
					<h2 className="text-2xl font-bold text-white flex items-center gap-2">
						<FiZap className="text-red-400" />
						Smart Debugging Demo
					</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
				</div>
				<div className="p-6">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-1">
							<h3 className="text-lg font-semibold text-white mb-3">Code Analysis</h3>
							<pre className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-3 text-white font-mono text-xs overflow-x-auto">
								{sampleCode}
							</pre>
						</div>
						<div className="lg:col-span-1">
							<h3 className="text-lg font-semibold text-white mb-3">Detected Issues</h3>
							{isAnalyzing ? (
								<div className="flex items-center gap-2 text-yellow-400">
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400"></div>
									Analyzing code for issues...
								</div>
							) : (
								<div className="space-y-2">
									{issues.map((issue) => (
										<div
											key={issue.id}
											onClick={() => setSelectedIssue(issue)}
											className={`p-3 rounded cursor-pointer border ${
												selectedIssue?.id === issue.id
													? 'border-blue-500 bg-blue-500/10'
													: 'border-[#2a2a2a] bg-[#1a1a1a]'
											}`}
										>
											<div className="flex items-center gap-2 mb-1">
												<span className={`w-2 h-2 rounded-full ${
													issue.severity === 'high' ? 'bg-red-500' :
													issue.severity === 'medium' ? 'bg-yellow-500' :
													'bg-blue-500'
												}`}></span>
												<span className="text-sm font-medium text-white">{issue.message}</span>
											</div>
											<div className="text-xs text-gray-400">Line {issue.line}</div>
										</div>
									))}
								</div>
							)}
						</div>
						<div className="lg:col-span-1">
							<h3 className="text-lg font-semibold text-white mb-3">Issue Details</h3>
							{selectedIssue ? (
								<div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded p-4">
									<div className="mb-3">
										<div className="text-sm text-gray-400 mb-1">Description</div>
										<div className="text-white">{selectedIssue.description}</div>
									</div>
									<div className="mb-3">
										<div className="text-sm text-gray-400 mb-1">Suggestion</div>
										<div className="text-white">{selectedIssue.suggestion}</div>
									</div>
									<div className="mb-3">
										<div className="text-sm text-gray-400 mb-1">Fix</div>
										<pre className="text-sm text-green-400 font-mono bg-[#0a0a0a] p-2 rounded">
											{selectedIssue.fix}
										</pre>
									</div>
									<button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
										Apply Fix
									</button>
								</div>
							) : (
								<div className="text-gray-400 text-center py-8">
									Select an issue to view details
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const AnalyticsDemo: React.FC<{ onClose: () => void }> = ({ onClose }) => {
	const [metrics, setMetrics] = useState<any>({});
	const [isLoading, setIsLoading] = useState(false);

	const generateMetrics = async () => {
		setIsLoading(true);
		// Simulate real-time analytics
		setTimeout(() => {
			setMetrics({
				codeQuality: {
					score: 87,
					trend: 'up',
					issues: 12,
					complexity: 'medium'
				},
				performance: {
					score: 92,
					trend: 'up',
					loadTime: '1.2s',
					bundleSize: '2.1MB'
				},
				security: {
					score: 95,
					trend: 'stable',
					vulnerabilities: 0,
					lastScan: '2 hours ago'
				},
				maintainability: {
					score: 78,
					trend: 'down',
					technicalDebt: 'medium',
					documentation: '60%'
				}
			});
			setIsLoading(false);
		}, 1500);
	};

	useEffect(() => {
		generateMetrics();
	}, []);

	const getTrendIcon = (trend: string) => {
		switch (trend) {
			case 'up': return '↗️';
			case 'down': return '↘️';
			default: return '→';
		}
	};

	const getScoreColor = (score: number) => {
		if (score >= 90) return 'text-green-400';
		if (score >= 70) return 'text-yellow-400';
		return 'text-red-400';
	};

	return (
		<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
			<div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
				<div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
					<h2 className="text-2xl font-bold text-white flex items-center gap-2">
						<FiBarChart className="text-green-400" />
						Code Analytics Demo
					</h2>
					<button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
				</div>
				<div className="p-6">
					{isLoading ? (
						<div className="flex items-center justify-center py-12">
							<div className="flex items-center gap-2 text-blue-400">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
								Generating real-time analytics...
							</div>
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							{Object.entries(metrics).map(([key, data]: [string, any]) => (
								<div key={key} className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-lg font-semibold text-white capitalize">
											{key.replace(/([A-Z])/g, ' $1').trim()}
										</h3>
										<span className="text-2xl">{getTrendIcon(data.trend)}</span>
									</div>
									
									<div className="mb-4">
										<div className="flex items-center gap-2 mb-2">
											<span className={`text-3xl font-bold ${getScoreColor(data.score)}`}>
												{data.score}
											</span>
											<span className="text-gray-400">/ 100</span>
										</div>
										<div className="w-full bg-gray-700 rounded-full h-2">
											<div 
												className={`h-2 rounded-full ${
													data.score >= 90 ? 'bg-green-500' :
													data.score >= 70 ? 'bg-yellow-500' :
													'bg-red-500'
												}`}
												style={{ width: `${data.score}%` }}
											></div>
										</div>
									</div>

									<div className="space-y-2">
										{Object.entries(data).filter(([k]) => k !== 'score' && k !== 'trend').map(([k, v]: [string, any]) => (
											<div key={k} className="flex justify-between text-sm">
												<span className="text-gray-400 capitalize">
													{k.replace(/([A-Z])/g, ' $1').trim()}:
												</span>
												<span className="text-white">{v}</span>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					)}
					
					<div className="mt-6 p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
						<h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
						<div className="space-y-2 text-sm">
							<div className="flex items-center gap-2">
								<span className="text-yellow-400">⚠️</span>
								<span className="text-white">Improve documentation coverage (currently 60%)</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-blue-400">💡</span>
								<span className="text-white">Consider reducing bundle size for better performance</span>
							</div>
							<div className="flex items-center gap-2">
								<span className="text-green-400">✅</span>
								<span className="text-white">Security scan passed with no vulnerabilities</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const AdvancedFeatures: React.FC = () => {
	const [activeDemo, setActiveDemo] = useState<'prediction' | 'debugging' | 'analytics' | null>(null);

	const features = [
		{
			icon: <BsLightningCharge />,
			title: 'AI Code Prediction',
			description: 'Intelligent code completion and suggestions based on context and user patterns',
			status: 'active' as const,
			onClick: () => setActiveDemo('prediction'),
			stats: [
				{ label: 'Accuracy', value: '95%', trend: 'up' as const },
				{ label: 'Suggestions', value: '150+', trend: 'neutral' as const }
			]
		},
		{
			icon: <FiZap />,
			title: 'Smart Debugging',
			description: 'AI-powered root cause analysis with automatic fix suggestions',
			status: 'active' as const,
			onClick: () => setActiveDemo('debugging'),
			stats: [
				{ label: 'Issues Found', value: '12', trend: 'down' as const },
				{ label: 'Fixed', value: '8', trend: 'up' as const }
			]
		},
		{
			icon: <FiBarChart />,
			title: 'Real-time Analytics',
			description: 'Comprehensive code quality metrics and performance insights',
			status: 'active' as const,
			onClick: () => setActiveDemo('analytics'),
			stats: [
				{ label: 'Quality Score', value: 'A+', trend: 'up' as const },
				{ label: 'Performance', value: '92%', trend: 'up' as const }
			]
		},
		{
			icon: <FiShield />,
			title: 'Security Scanner',
			description: 'Advanced vulnerability detection and security compliance checking',
			status: 'active' as const,
			stats: [
				{ label: 'Vulnerabilities', value: '0', trend: 'neutral' as const },
				{ label: 'Compliance', value: '100%', trend: 'up' as const }
			]
		},
		{
			icon: <FiTarget />,
			title: 'Performance Optimization',
			description: 'AI-driven performance analysis and automatic optimization suggestions',
			status: 'active' as const,
			stats: [
				{ label: 'Optimizations', value: '15', trend: 'up' as const },
				{ label: 'Speed Gain', value: '+45%', trend: 'up' as const }
			]
		},
		{
			icon: <FiZap />,
			title: 'Smart Refactoring',
			description: 'Intelligent code refactoring with pattern recognition and suggestions',
			status: 'active' as const,
			stats: [
				{ label: 'Refactors', value: '23', trend: 'up' as const },
				{ label: 'Quality', value: '+30%', trend: 'up' as const }
			]
		},
		{
			icon: <BsGear />,
			title: 'Auto-Configuration',
			description: 'Automatic project setup and configuration based on best practices',
			status: 'active' as const,
			stats: [
				{ label: 'Configs', value: '8', trend: 'neutral' as const },
				{ label: 'Time Saved', value: '2h', trend: 'up' as const }
			]
		},
		{
			icon: <BsGraphUp />,
			title: 'Trend Analysis',
			description: 'Track code quality trends and development patterns over time',
			status: 'active' as const,
			stats: [
				{ label: 'Trends', value: '12', trend: 'up' as const },
				{ label: 'Insights', value: '45', trend: 'up' as const }
			]
		}
	];

	return (
		<div className="p-6">
			<div className="mb-8">
				<h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
					<BsLightningCharge className="text-blue-400" />
					Advanced AI Features
				</h2>
				<p className="text-gray-300 text-lg">
					Experience the future of coding with our cutting-edge AI-powered features that go beyond traditional IDEs
				</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
				{features.map((feature, index) => (
					<FeatureCard key={index} {...feature} />
				))}
			</div>

			{/* Demo Modals */}
			{activeDemo === 'prediction' && (
				<PredictionDemo onClose={() => setActiveDemo(null)} />
			)}
			
			{activeDemo === 'debugging' && (
				<DebuggingDemo onClose={() => setActiveDemo(null)} />
			)}
			
			{activeDemo === 'analytics' && (
				<AnalyticsDemo onClose={() => setActiveDemo(null)} />
			)}
		</div>
	);
};

export default AdvancedFeatures;
