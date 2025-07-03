export interface TestCase {
    id: string;
    title: string;
    status: 'Draft' | 'Ready' | 'Passed' | 'Failed';
    description?: string;
    testType?: 'unit' | 'integration' | 'system' | 'acceptance' | 'regression' | 'smoke';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    createdAt?: Date;
    updatedAt?: Date;
}

export type TestCaseStatus = 'Draft' | 'Ready' | 'Passed' | 'Failed';