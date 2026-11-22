export interface TestCase {
    id: string;
    title: string;
    status: TestCaseStatus;
    description?: string;
    testType?: 'unit' | 'integration' | 'system' | 'acceptance' | 'regression' | 'smoke';
    priority?: 'critical' | 'high' | 'medium' | 'low';
    createdAt?: Date;
    updatedAt?: Date;
}

export const TEST_CASE_STATUSES = ['Draft', 'Ready', 'In Progress', 'Passed', 'Failed', 'Blocked', 'Skipped'] as const;
export type TestCaseStatus = typeof TEST_CASE_STATUSES[number];
