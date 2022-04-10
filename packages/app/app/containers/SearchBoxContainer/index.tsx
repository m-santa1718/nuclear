import React, { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { MetaProvider } from '@nuclear/core';
import { SearchBox } from '@nuclear/ui';
import { SearchActions, unifiedSearch } from '../../actions/search';
import { pluginsSelectors } from '../../selectors/plugins';
import { searchSelectors } from '../../selectors/search';
import { connectivity } from '../../selectors/connectivity';
import { selectMetaProvider } from '../../actions/plugins';

const MIN_SEARCH_LENGTH = 2;

const providerToOption = (provider?: MetaProvider) => provider && ({
  key: provider.sourceName.toLowerCase(),
  text: provider.searchName,
  value: provider.sourceName
});

const SearchBoxContainer: React.FC = () => {
  const { t } = useTranslation('search');
  const history = useHistory();
  const dispatch = useDispatch();
  const unifiedSearchStarted = useSelector(searchSelectors.unifiedSearchStarted);
  const isConnected = useSelector(connectivity);
  const searchProviders = useSelector(pluginsSelectors.plugins).metaProviders as MetaProvider[];
  const searchHistory = useSelector(searchSelectors.searchHistory);
  const selectedSearchProvider = useSelector(pluginsSelectors.selected)?.metaProviders;
  const isFocused = useSelector(searchSelectors.isFocused);
  const handleFocus = useCallback((focusState: boolean) => dispatch(SearchActions.setSearchDropdownVisibility(focusState)), [dispatch]);

  const searchProvidersOptions = searchProviders?.map(providerToOption) ?? [];
  const selectedSearchProviderOption = providerToOption(
    searchProviders?.find(provider => provider.sourceName === selectedSearchProvider)
  );

  const handleSearch = useCallback(value =>
    value.length >= MIN_SEARCH_LENGTH
      ? dispatch(unifiedSearch(value, history))
      : null,
  [dispatch, history]
  );
  const handleClearSearchHistory = useCallback(() => dispatch(SearchActions.updateSearchHistory([])), [dispatch]);
  const handleSelectSearchProvider = useCallback((provider: ReturnType<typeof providerToOption>) =>
    provider && dispatch(selectMetaProvider(provider.value)),
  [dispatch]);

  const [input, setInput] = useState('');
 
  const debouncedSearch = useCallback(_.debounce(handleSearch, 500), [handleSearch]);

  useEffect(() => {
    if (input.length > MIN_SEARCH_LENGTH) {
      debouncedSearch(input);
    }
  }, [input, debouncedSearch]);

  
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(input);
    }
    if (e.key === 'Escape') {
      handleFocus(false);
    }
  };

  return <SearchBox 
    loading={unifiedSearchStarted}
    disabled={!isConnected}
    placeholder={t('placeholder')}
    lastSearchesLabel={t('last-searches')}
    clearHistoryLabel={t('clear-history')}
    footerLabel={t('you-can-search-for')}
    onSearch={handleSearch}
    searchProviders={searchProvidersOptions}
    searchHistory={searchHistory}
    onClearHistory={handleClearSearchHistory}
    selectedSearchProvider={selectedSearchProviderOption}
    onSearchProviderSelect={handleSelectSearchProvider}
    isFocused={isFocused}
    handleFocus={handleFocus}
    onKeyDown={onKeyDown}
    input={input}
    setInput={setInput}
  />;
};

export default SearchBoxContainer;
